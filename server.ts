import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import express, { type NextFunction, type Request, type Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

type UserRole = 'resident' | 'admin';
type ReportStatus = 'Pending' | 'In Progress' | 'Resolved';

interface StoredUser {
  id: string;
  name: string;
  contact: string;
  phone: string;
  purok: string;
  role: UserRole;
  passwordHash: string | null;
  notificationsEnabled: boolean;
  createdAt: string;
}

interface PurokProgress {
  id: string;
  name: string;
  collectedHouseholds: number;
  totalHouseholds: number;
}

interface NextSchedule {
  id: string;
  dateLabel: string;
  timeWindow: string;
  location: string;
  collectedHouseholds: number;
  totalHouseholds: number;
  puroks: PurokProgress[];
  notes: string;
  updatedAt: string;
}

interface CollectionRecord {
  id: string;
  dateLabel: string;
  dayOfWeek: string;
  collectedHouseholds: number;
  totalHouseholds: number;
  status: 'Completed' | 'Scheduled' | 'Partial';
  notes: string;
  createdAt: string;
}

interface WasteReport {
  id: string;
  userId: string;
  reporterName: string;
  reporterContact: string;
  purok: string;
  type: string;
  description: string;
  photoDataUrl: string | null;
  resolutionPhotoDataUrl?: string | null;
  status: ReportStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  adminCredentialHash: string | null;
  users: StoredUser[];
  nextSchedule: NextSchedule;
  records: CollectionRecord[];
  reports: WasteReport[];
}

interface SessionPayload {
  sub: string;
  role: UserRole;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: StoredUser;
}

const VALID_REPORT_TYPES = new Set([
  'Uncollected Waste',
  'Illegal Dumping',
  'Overflowing Bin',
  'Damaged Collection Bin',
  'Missed Street / Purok',
  'Hazardous Waste',
  'Other Concern',
]);

const VALID_REPORT_STATUSES = new Set<ReportStatus>(['Pending', 'In Progress', 'Resolved']);
const VALID_RECORD_STATUSES = new Set(['Completed', 'Scheduled', 'Partial']);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'trashtrack.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }
  const [salt, expectedHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, expected);
}

function verifyEnvPasscode(candidate: string, configured: string): boolean {
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(configured).digest();
  return crypto.timingSafeEqual(a, b);
}

function signToken(user: StoredUser): string {
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) {
    return null;
  }
  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.sub || !parsed.role || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function createInitialStore(): StoreData {
  const now = new Date().toISOString();
  return {
    adminCredentialHash: null,
    users: [
      {
        id: 'admin-captain',
        name: 'Barangay Captain',
        contact: 'captain@barangaycalongay.gov.ph',
        phone: '+63 917 123 4567',
        purok: 'Barangay Hall, Barangay Calongay',
        role: 'admin',
        passwordHash: null,
        notificationsEnabled: true,
        createdAt: now,
      },
      {
        id: 'resident-juan',
        name: 'Juan Dela Cruz',
        contact: 'juandelacruz@email.com',
        phone: '+63 918 456 7890',
        purok: 'Purok 2, Barangay Calongay',
        role: 'resident',
        passwordHash: null,
        notificationsEnabled: true,
        createdAt: now,
      },
      {
        id: 'resident-maria',
        name: 'Maria Santos',
        contact: 'maria.santos@email.com',
        phone: '+63 919 812 3344',
        purok: 'Purok 4, Barangay Calongay',
        role: 'resident',
        passwordHash: null,
        notificationsEnabled: true,
        createdAt: now,
      },
    ],
    nextSchedule: {
      id: 'next-collection',
      dateLabel: 'Wednesday, October 14',
      timeWindow: '7:00 AM - 10:00 AM',
      location: 'Barangay Calongay',
      collectedHouseholds: 0,
      totalHouseholds: 278,
      puroks: [
        {
          id: 'purok-1',
          name: 'PUROK 1',
          collectedHouseholds: 0,
          totalHouseholds: 138,
        },
        {
          id: 'purok-2',
          name: 'PUROK 2',
          collectedHouseholds: 0,
          totalHouseholds: 140,
        },
      ],
      notes: 'Regular morning route across Purok 1 and Purok 2. Please place segregated waste bins curbside by 6:45 AM.',
      updatedAt: now,
    },
    records: [],
    reports: [],
  };
}

function loadStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = createInitialStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoreData;
    if (!Array.isArray(parsed.nextSchedule?.puroks) || parsed.nextSchedule.puroks.length === 0) {
      parsed.nextSchedule.puroks = [
        { id: 'purok-1', name: 'PUROK 1', collectedHouseholds: 0, totalHouseholds: 138 },
        { id: 'purok-2', name: 'PUROK 2', collectedHouseholds: 0, totalHouseholds: 140 },
      ];
      parsed.nextSchedule.collectedHouseholds = 0;
      parsed.nextSchedule.totalHouseholds = 278;
    }
    return parsed;
  } catch {
    const initial = createInitialStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

let store: StoreData = loadStore();

function saveStore(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

function sanitizeUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    contact: user.contact,
    phone: user.phone,
    purok: user.purok,
    role: user.role,
    notificationsEnabled: user.notificationsEnabled,
  };
}

function getAdminConfigStatus() {
  const envPasscode = process.env.ADMIN_PASSCODE?.trim();
  if (envPasscode) {
    return { configured: true, source: 'env' as const };
  }
  if (store.adminCredentialHash) {
    return { configured: true, source: 'claimed' as const };
  }
  return { configured: false, source: 'unclaimed' as const };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }
  const user = store.users.find((u) => u.id === payload.sub && u.role === payload.role);
  if (!user) {
    res.status(401).json({ error: 'Account not found.' });
    return;
  }
  req.authUser = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.authUser || req.authUser.role !== 'admin') {
      res.status(403).json({ error: 'Restricted to Barangay Captain Admin.' });
      return;
    }
    next();
  });
}

function isValidImageDataUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length > 2_800_000) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}

function computeSummary(reports: WasteReport[]) {
  const byType: Record<string, number> = {};
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;

  for (const r of reports) {
    byType[r.type] = (byType[r.type] || 0) + 1;
    if (r.status === 'Pending') pending += 1;
    else if (r.status === 'In Progress') inProgress += 1;
    else if (r.status === 'Resolved') resolved += 1;
  }

  return {
    total: reports.length,
    pending,
    inProgress,
    resolved,
    byType,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/auth/admin-status', (_req, res) => {
    res.json(getAdminConfigStatus());
  });

  app.post('/api/auth/admin-claim', (req, res) => {
    const status = getAdminConfigStatus();
    if (status.configured) {
      res.status(409).json({ error: 'Admin passcode is already configured.' });
      return;
    }
    const { passcode } = req.body as { passcode?: unknown };
    if (typeof passcode !== 'string' || passcode.trim().length < 6 || passcode.trim().length > 100) {
      res.status(400).json({ error: 'Please choose an admin passcode between 6 and 100 characters.' });
      return;
    }
    const trimmed = passcode.trim();
    store.adminCredentialHash = hashPassword(trimmed);
    saveStore();

    const adminUser = store.users.find((u) => u.role === 'admin');
    if (!adminUser) {
      res.status(500).json({ error: 'Admin profile missing.' });
      return;
    }
    const token = signToken(adminUser);
    res.status(201).json({ token, user: sanitizeUser(adminUser) });
  });

  app.post('/api/auth/admin-login', (req, res) => {
    const { passcode } = req.body as { passcode?: unknown };
    if (typeof passcode !== 'string' || !passcode.trim()) {
      res.status(400).json({ error: 'Please enter the Barangay Captain passcode.' });
      return;
    }
    const candidate = passcode.trim();
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();

    let authorized = false;
    if (envPasscode) {
      authorized = verifyEnvPasscode(candidate, envPasscode);
    } else if (store.adminCredentialHash) {
      authorized = verifyPassword(candidate, store.adminCredentialHash);
    } else {
      res.status(409).json({ error: 'Admin passcode has not been claimed yet.' });
      return;
    }

    if (!authorized) {
      res.status(401).json({ error: 'Incorrect Barangay Captain passcode.' });
      return;
    }

    const adminUser = store.users.find((u) => u.role === 'admin');
    if (!adminUser) {
      res.status(500).json({ error: 'Admin profile missing.' });
      return;
    }
    const token = signToken(adminUser);
    res.json({ token, user: sanitizeUser(adminUser) });
  });

  app.put('/api/auth/admin-passcode', requireAdmin, (req, res) => {
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode) {
      res.status(409).json({
        error:
          'Admin passcode is currently set by the ADMIN_PASSCODE environment variable. Update or remove that environment variable to change it from the dashboard.',
      });
      return;
    }

    if (!store.adminCredentialHash) {
      res.status(409).json({ error: 'Admin passcode has not been claimed yet.' });
      return;
    }

    const { currentPasscode, newPasscode } = req.body as {
      currentPasscode?: unknown;
      newPasscode?: unknown;
    };

    if (typeof currentPasscode !== 'string' || !currentPasscode.trim()) {
      res.status(400).json({ error: 'Please enter your current Barangay Captain passcode.' });
      return;
    }

    if (
      typeof newPasscode !== 'string' ||
      newPasscode.trim().length < 6 ||
      newPasscode.trim().length > 100
    ) {
      res.status(400).json({ error: 'New passcode must be between 6 and 100 characters.' });
      return;
    }

    const cleanCurrent = currentPasscode.trim();
    const cleanNew = newPasscode.trim();

    if (!verifyPassword(cleanCurrent, store.adminCredentialHash)) {
      res.status(401).json({ error: 'Current Barangay Captain passcode is incorrect.' });
      return;
    }

    if (cleanCurrent === cleanNew) {
      res.status(400).json({ error: 'New passcode must be different from your current passcode.' });
      return;
    }

    store.adminCredentialHash = hashPassword(cleanNew);
    saveStore();
    res.json({ ok: true, message: 'Barangay Captain passcode updated.' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, contact, purok, password } = req.body as {
      name?: unknown;
      contact?: unknown;
      purok?: unknown;
      password?: unknown;
    };

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
      res.status(400).json({ error: 'Please enter your full name (2–80 characters).' });
      return;
    }
    if (typeof contact !== 'string' || contact.trim().length < 4 || contact.trim().length > 120) {
      res.status(400).json({ error: 'Please enter a valid email address or phone number.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const normalizedContact = contact.trim().toLowerCase();
    const existing = store.users.find(
      (u) => u.contact.toLowerCase() === normalizedContact || u.phone.toLowerCase() === normalizedContact,
    );
    if (existing) {
      res.status(409).json({ error: 'An account with that email or phone number already exists.' });
      return;
    }

    const cleanPurok =
      typeof purok === 'string' && purok.trim().length > 0
        ? purok.trim().slice(0, 80)
        : 'Barangay Calongay, Pilar, Sorsogon';

    const isPhone = /^[+\d\s()-]{7,}$/.test(contact.trim());
    const newUser: StoredUser = {
      id: `resident-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      contact: contact.trim(),
      phone: isPhone ? contact.trim() : '',
      purok: cleanPurok,
      role: 'resident',
      passwordHash: hashPassword(password),
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    saveStore();

    const token = signToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { contact, password } = req.body as { contact?: unknown; password?: unknown };
    if (typeof contact !== 'string' || !contact.trim() || typeof password !== 'string' || !password) {
      res.status(400).json({ error: 'Please enter your email or phone number and password.' });
      return;
    }

    const needle = contact.trim().toLowerCase();
    const user = store.users.find(
      (u) =>
        u.role === 'resident' &&
        (u.contact.toLowerCase() === needle || (u.phone && u.phone.toLowerCase() === needle)),
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. Check your email/phone or sign up.' });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({
        error: 'This sample resident profile uses Quick Resident Sign-In below, or sign up with a new account.',
      });
      return;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Incorrect email/phone or password.' });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/demo-resident', (_req, res) => {
    const sampleUser = store.users.find((u) => u.id === 'resident-juan' && u.role === 'resident');
    if (!sampleUser) {
      res.status(404).json({ error: 'Sample resident account unavailable.' });
      return;
    }
    const token = signToken(sampleUser);
    res.json({ token, user: sanitizeUser(sampleUser) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ user: sanitizeUser(req.authUser!) });
  });

  app.patch('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const { name, contact, phone, purok, notificationsEnabled } = req.body as {
      name?: unknown;
      contact?: unknown;
      phone?: unknown;
      purok?: unknown;
      notificationsEnabled?: unknown;
    };

    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed.length < 2 || trimmed.length > 80) {
        res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
        return;
      }
      user.name = trimmed;
    }
    if (typeof contact === 'string') {
      const trimmed = contact.trim();
      if (trimmed.length < 4 || trimmed.length > 120) {
        res.status(400).json({ error: 'Contact must be between 4 and 120 characters.' });
        return;
      }
      user.contact = trimmed;
    }
    if (typeof phone === 'string') {
      user.phone = phone.trim().slice(0, 40);
    }
    if (typeof purok === 'string') {
      user.purok = purok.trim().slice(0, 80);
    }
    if (typeof notificationsEnabled === 'boolean') {
      user.notificationsEnabled = notificationsEnabled;
    }

    saveStore();
    res.json({ user: sanitizeUser(user) });
  });

  app.get('/api/schedule', (_req, res) => {
    res.json({
      nextSchedule: store.nextSchedule,
      records: store.records,
    });
  });

  app.put('/api/schedule', requireAdmin, (req, res) => {
    const { dateLabel, timeWindow, location, collectedHouseholds, totalHouseholds, puroks, notes } = req.body as {
      dateLabel?: unknown;
      timeWindow?: unknown;
      location?: unknown;
      collectedHouseholds?: unknown;
      totalHouseholds?: unknown;
      puroks?: unknown;
      notes?: unknown;
    };

    if (Array.isArray(puroks)) {
      if (puroks.length === 0 || puroks.length > 20) {
        res.status(400).json({ error: 'Invalid purok progress list.' });
        return;
      }
      const cleanPuroks: PurokProgress[] = [];
      for (const item of puroks) {
        if (!item || typeof item !== 'object') {
          res.status(400).json({ error: 'Invalid purok entry.' });
          return;
        }
        const entry = item as Partial<PurokProgress>;
        const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim().slice(0, 40) : '';
        const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim().slice(0, 40) : name.toLowerCase().replace(/\s+/g, '-');
        const total = entry.totalHouseholds;
        const collected = entry.collectedHouseholds;
        if (!name || typeof total !== 'number' || !Number.isInteger(total) || total < 1 || total > 5000) {
          res.status(400).json({ error: 'Each purok must have a valid total households count (1–5,000).' });
          return;
        }
        if (typeof collected !== 'number' || !Number.isInteger(collected) || collected < 0 || collected > total) {
          res.status(400).json({ error: `${name} collected households cannot exceed ${total}.` });
          return;
        }
        cleanPuroks.push({ id, name, collectedHouseholds: collected, totalHouseholds: total });
      }
      store.nextSchedule.puroks = cleanPuroks;
      store.nextSchedule.collectedHouseholds = cleanPuroks.reduce((acc, p) => acc + p.collectedHouseholds, 0);
      store.nextSchedule.totalHouseholds = cleanPuroks.reduce((acc, p) => acc + p.totalHouseholds, 0);
    } else {
      const nextTotal =
        typeof totalHouseholds === 'number' && Number.isInteger(totalHouseholds)
          ? totalHouseholds
          : store.nextSchedule.totalHouseholds;
      const nextCollected =
        typeof collectedHouseholds === 'number' && Number.isInteger(collectedHouseholds)
          ? collectedHouseholds
          : store.nextSchedule.collectedHouseholds;

      if (nextTotal < 1 || nextTotal > 5000) {
        res.status(400).json({ error: 'Total households must be between 1 and 5,000.' });
        return;
      }
      if (nextCollected < 0 || nextCollected > nextTotal) {
        res.status(400).json({ error: 'Collected households cannot exceed total households.' });
        return;
      }
      store.nextSchedule.collectedHouseholds = nextCollected;
      store.nextSchedule.totalHouseholds = nextTotal;
    }

    if (typeof dateLabel === 'string' && dateLabel.trim()) {
      store.nextSchedule.dateLabel = dateLabel.trim().slice(0, 80);
    }
    if (typeof timeWindow === 'string' && timeWindow.trim()) {
      store.nextSchedule.timeWindow = timeWindow.trim().slice(0, 60);
    }
    if (typeof location === 'string' && location.trim()) {
      store.nextSchedule.location = location.trim().slice(0, 100);
    }
    if (typeof notes === 'string') {
      store.nextSchedule.notes = notes.trim().slice(0, 500);
    }
    store.nextSchedule.updatedAt = new Date().toISOString();

    saveStore();
    res.json({ nextSchedule: store.nextSchedule });
  });

  app.post('/api/records', requireAdmin, (req, res) => {
    const { dateLabel, dayOfWeek, collectedHouseholds, totalHouseholds, status, notes } = req.body as {
      dateLabel?: unknown;
      dayOfWeek?: unknown;
      collectedHouseholds?: unknown;
      totalHouseholds?: unknown;
      status?: unknown;
      notes?: unknown;
    };

    if (typeof dateLabel !== 'string' || !dateLabel.trim()) {
      res.status(400).json({ error: 'Date label is required.' });
      return;
    }
    if (typeof dayOfWeek !== 'string' || !dayOfWeek.trim()) {
      res.status(400).json({ error: 'Day of week is required.' });
      return;
    }
    if (typeof totalHouseholds !== 'number' || !Number.isInteger(totalHouseholds) || totalHouseholds < 1 || totalHouseholds > 5000) {
      res.status(400).json({ error: 'Valid total households count is required.' });
      return;
    }
    if (typeof collectedHouseholds !== 'number' || !Number.isInteger(collectedHouseholds) || collectedHouseholds < 0 || collectedHouseholds > totalHouseholds) {
      res.status(400).json({ error: 'Collected households must be between 0 and total households.' });
      return;
    }
    const cleanStatus =
      typeof status === 'string' && VALID_RECORD_STATUSES.has(status) ? (status as CollectionRecord['status']) : 'Completed';

    const newRecord: CollectionRecord = {
      id: `rec-${crypto.randomUUID().slice(0, 8)}`,
      dateLabel: dateLabel.trim().slice(0, 60),
      dayOfWeek: dayOfWeek.trim().slice(0, 20),
      collectedHouseholds,
      totalHouseholds,
      status: cleanStatus,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 400) : '',
      createdAt: new Date().toISOString(),
    };

    store.records.unshift(newRecord);
    saveStore();
    res.status(201).json({ record: newRecord, records: store.records });
  });

  app.patch('/api/records/:id', requireAdmin, (req, res) => {
    const record = store.records.find((r) => r.id === req.params.id);
    if (!record) {
      res.status(404).json({ error: 'Collection record not found.' });
      return;
    }

    const { dateLabel, dayOfWeek, collectedHouseholds, totalHouseholds, status, notes } = req.body as {
      dateLabel?: unknown;
      dayOfWeek?: unknown;
      collectedHouseholds?: unknown;
      totalHouseholds?: unknown;
      status?: unknown;
      notes?: unknown;
    };

    const nextTotal =
      typeof totalHouseholds === 'number' && Number.isInteger(totalHouseholds)
        ? totalHouseholds
        : record.totalHouseholds;
    const nextCollected =
      typeof collectedHouseholds === 'number' && Number.isInteger(collectedHouseholds)
        ? collectedHouseholds
        : record.collectedHouseholds;

    if (nextTotal < 1 || nextTotal > 5000 || nextCollected < 0 || nextCollected > nextTotal) {
      res.status(400).json({ error: 'Invalid household collection counts.' });
      return;
    }

    if (typeof dateLabel === 'string' && dateLabel.trim()) record.dateLabel = dateLabel.trim().slice(0, 60);
    if (typeof dayOfWeek === 'string' && dayOfWeek.trim()) record.dayOfWeek = dayOfWeek.trim().slice(0, 20);
    if (typeof status === 'string' && VALID_RECORD_STATUSES.has(status)) {
      record.status = status as CollectionRecord['status'];
    }
    if (typeof notes === 'string') record.notes = notes.trim().slice(0, 400);
    record.collectedHouseholds = nextCollected;
    record.totalHouseholds = nextTotal;

    saveStore();
    res.json({ record, records: store.records });
  });

  app.delete('/api/records/:id', requireAdmin, (req, res) => {
    const idx = store.records.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Collection record not found.' });
      return;
    }
    store.records.splice(idx, 1);
    saveStore();
    res.json({ records: store.records });
  });

  // Strictly private reports:
  // - Admin (Barangay Captain) sees all reports + summary.
  // - Residents ONLY see their own submitted reports.
  app.get('/api/reports', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    if (user.role === 'admin') {
      res.json({
        reports: store.reports,
        summary: computeSummary(store.reports),
      });
      return;
    }
    const ownReports = store.reports.filter((r) => r.userId === user.id);
    res.json({
      reports: ownReports,
    });
  });

  app.get('/api/reports/summary', requireAdmin, (_req, res) => {
    res.json({ summary: computeSummary(store.reports) });
  });

  app.post('/api/reports', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const { type, description, purok, photoDataUrl } = req.body as {
      type?: unknown;
      description?: unknown;
      purok?: unknown;
      photoDataUrl?: unknown;
    };

    if (typeof type !== 'string' || !VALID_REPORT_TYPES.has(type)) {
      res.status(400).json({ error: 'Please select a valid report type.' });
      return;
    }
    if (typeof description !== 'string' || description.trim().length < 8 || description.trim().length > 1000) {
      res.status(400).json({ error: 'Please provide a clear description (8–1000 characters).' });
      return;
    }

    let cleanPhoto: string | null = null;
    if (photoDataUrl !== undefined && photoDataUrl !== null && photoDataUrl !== '') {
      if (!isValidImageDataUrl(photoDataUrl)) {
        res.status(400).json({ error: 'Invalid photo attachment. Please upload a JPG, PNG, or WebP image under 2 MB.' });
        return;
      }
      cleanPhoto = photoDataUrl;
    }

    const now = new Date().toISOString();
    const newReport: WasteReport = {
      id: `rep-${crypto.randomUUID().slice(0, 6)}`,
      userId: user.id,
      reporterName: user.name,
      reporterContact: user.contact,
      purok: typeof purok === 'string' && purok.trim() ? purok.trim().slice(0, 100) : user.purok,
      type,
      description: description.trim(),
      photoDataUrl: cleanPhoto,
      resolutionPhotoDataUrl: null,
      status: 'Pending',
      adminNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    store.reports.unshift(newReport);
    saveStore();
    res.status(201).json({ report: newReport });
  });

  app.patch('/api/reports/:id', requireAdmin, (req, res) => {
    const report = store.reports.find((r) => r.id === req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }
    const { status, adminNotes, resolutionPhotoDataUrl } = req.body as {
      status?: unknown;
      adminNotes?: unknown;
      resolutionPhotoDataUrl?: unknown;
    };
    let nextStatus = report.status;
    if (status !== undefined) {
      if (typeof status !== 'string' || !VALID_REPORT_STATUSES.has(status as ReportStatus)) {
        res.status(400).json({ error: 'Invalid report status.' });
        return;
      }
      nextStatus = status as ReportStatus;
    }
    if (adminNotes !== undefined) {
      if (typeof adminNotes !== 'string') {
        res.status(400).json({ error: 'Invalid admin notes.' });
        return;
      }
      report.adminNotes = adminNotes.trim().slice(0, 500);
    }
    if (resolutionPhotoDataUrl !== undefined) {
      if (resolutionPhotoDataUrl === null || resolutionPhotoDataUrl === '') {
        report.resolutionPhotoDataUrl = null;
      } else {
        if (nextStatus !== 'Resolved') {
          res.status(400).json({ error: 'Resolution photos can only be attached to Resolved reports.' });
          return;
        }
        if (!isValidImageDataUrl(resolutionPhotoDataUrl)) {
          res.status(400).json({
            error: 'Invalid resolution photo. Please upload a JPG, PNG, or WebP image under 2 MB.',
          });
          return;
        }
        report.resolutionPhotoDataUrl = resolutionPhotoDataUrl;
      }
    }
    report.status = nextStatus;
    report.updatedAt = new Date().toISOString();
    saveStore();
    res.json({ report, summary: computeSummary(store.reports) });
  });

  app.delete('/api/reports/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.authUser!;
    const idx = store.reports.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    const report = store.reports[idx];
    if (user.role !== 'admin' && report.userId !== user.id) {
      res.status(403).json({ error: 'You can only delete your own submitted reports.' });
      return;
    }

    store.reports.splice(idx, 1);
    saveStore();
    res.json({
      deletedId: report.id,
      ...(user.role === 'admin' ? { summary: computeSummary(store.reports) } : {}),
    });
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const serveProduction =
    process.env.NODE_ENV === 'production' ||
    (process.env.npm_lifecycle_event === 'start' && fs.existsSync(distIndex));

  if (!serveProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API route not found.' });
        return;
      }
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrashTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TrashTrack server:', err);
  process.exit(1);
});
