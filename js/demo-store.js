const DEMO_PASSWORD = 'posgrado';
const USERS_KEY = 'ssa-demo-profiles';
const PASSWORDS_KEY = 'ssa-demo-passwords';
const SESSION_KEY = 'ssa-demo-session';
const DATABASE_NAME = 'ssa-demo-files';
const FILES_STORE = 'files';

const initialProfiles = [
  { id: 'demo-admin', nombre: 'Dany Hertiz', email: 'danyhertiz@gmail.com', rol: 'admin', onboarding_completo: true },
  { id: 'demo-monitor', nombre: 'Hertiz Ivea', email: 'hertizivea@gmail.com', rol: 'monitor', onboarding_completo: true },
  { id: 'demo-facilitador', nombre: 'UnADM Posgrado', email: 'unadmpogrado@gmail.com', rol: 'facilitador', onboarding_completo: true },
  { id: 'demo-estudiante', nombre: 'Usuario UnADM', email: 'unadmusuario@gmail.com', rol: 'estudiante', onboarding_completo: true },
];

const initialTables = {
  estudiantes: [
    { perfil_id: 'demo-estudiante', matricula: 'SIM-2026-001', grado: 'Posgrado', institucion: 'UnADM' },
  ],
  facilitadores: [
    { perfil_id: 'demo-facilitador', area_expertise: 'Seguimiento académico', experiencia: 5, institucion: 'UnADM' },
  ],
  monitores: [
    { perfil_id: 'demo-monitor', interes_academico: 'Permanencia y aprendizaje', institucion: 'UnADM' },
  ],
};

function readJson(key, fallback) {
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`No se pudieron leer los datos locales "${key}".`, error);
    throw new Error('Los datos locales están dañados. Limpia los datos del sitio para reiniciar la simulación.');
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProfiles() {
  const profiles = readJson(USERS_KEY, null);
  if (profiles) return profiles;

  writeJson(USERS_KEY, initialProfiles);
  writeJson(PASSWORDS_KEY, Object.fromEntries(initialProfiles.map(profile => [profile.email, DEMO_PASSWORD])));
  writeJson('ssa-demo-tables', initialTables);
  return initialProfiles;
}

function currentUser() {
  const session = readJson(SESSION_KEY, null);
  if (!session?.user?.id) return null;
  return getProfiles().find(profile => profile.id === session.user.id) || null;
}

class LocalQuery {
  constructor(table) {
    this.table = table;
    this.operation = 'select';
    this.columns = '*';
    this.values = null;
    this.filters = [];
    this.sort = null;
    this.singleMode = null;
  }

  select(columns = '*') {
    this.columns = columns;
    return this;
  }

  insert(values) {
    this.operation = 'insert';
    this.values = values;
    return this;
  }

  upsert(values) {
    this.operation = 'upsert';
    this.values = values;
    return this;
  }

  update(values) {
    this.operation = 'update';
    this.values = values;
    return this;
  }

  eq(column, value) {
    this.filters.push([column, value]);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.sort = [column, ascending];
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    const tables = readJson('ssa-demo-tables', {});
    const rows = this.table === 'perfiles' ? getProfiles() : tables[this.table] || [];
    let result;

    if (this.operation === 'insert' || this.operation === 'upsert') {
      const values = (Array.isArray(this.values) ? this.values : [this.values]).map(value => ({ ...value }));
      for (const value of values) {
        const identity = value.id ?? value.perfil_id;
        const existingIndex = rows.findIndex(row => (row.id ?? row.perfil_id) === identity && identity !== undefined);
        if (this.operation === 'upsert' && existingIndex !== -1) {
          rows[existingIndex] = { ...rows[existingIndex], ...value };
        } else {
          rows.push(value);
        }
      }
      result = values;
    } else {
      let matched = rows.filter(row => this.filters.every(([column, value]) => row[column] === value));
      if (this.operation === 'update') {
        matched.forEach(row => Object.assign(row, this.values));
        result = matched;
      } else {
        if (this.sort) {
          const [column, ascending] = this.sort;
          matched = matched.sort((a, b) => String(a[column] ?? '').localeCompare(String(b[column] ?? ''), 'es') * (ascending ? 1 : -1));
        }
        result = matched.map(row => {
          if (this.columns === '*') return { ...row };
          return Object.fromEntries(this.columns.split(',').map(column => column.trim()).filter(Boolean).map(column => [column, row[column]]));
        });
      }
    }

    tables[this.table] = rows;
    writeJson('ssa-demo-tables', tables);
    if (this.table === 'perfiles') writeJson(USERS_KEY, rows);

    if (this.singleMode) {
      if (this.singleMode === 'single' && result.length !== 1) {
        return { data: null, error: new Error('Se esperaba exactamente un registro.') };
      }
      return { data: result[0] || null, error: null };
    }
    return { data: result, error: null };
  }
}

function openFileDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(FILES_STORE, { keyPath: 'path' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento local de archivos.'));
  });
}

async function runFileTransaction(mode, operation) {
  const database = await openFileDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, mode);
    const request = operation(transaction.objectStore(FILES_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo acceder al archivo local.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error || new Error('Falló el almacenamiento del archivo local.'));
  });
}

const demoStore = {
  auth: {
    async getSession() {
      const profile = currentUser();
      return { data: { session: profile ? { user: { id: profile.id, email: profile.email } } : null }, error: null };
    },
    async getUser() {
      const profile = currentUser();
      return { data: { user: profile ? { id: profile.id, email: profile.email } : null }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const normalizedEmail = email.trim().toLowerCase();
      const profile = getProfiles().find(user => user.email.toLowerCase() === normalizedEmail);
      const passwords = readJson(PASSWORDS_KEY, {});
      if (!profile || passwords[normalizedEmail] !== password) {
        return { data: { user: null }, error: new Error('Invalid login credentials') };
      }
      writeJson(SESSION_KEY, { user: { id: profile.id, email: profile.email } });
      return { data: { user: { id: profile.id, email: profile.email } }, error: null };
    },
    async signUp({ email, password, options }) {
      const normalizedEmail = email.trim().toLowerCase();
      const profiles = getProfiles();
      if (profiles.some(profile => profile.email.toLowerCase() === normalizedEmail)) {
        return { data: { user: null }, error: new Error('User already registered') };
      }
      const profile = {
        id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nombre: options?.data?.nombre || '',
        email: normalizedEmail,
        rol: 'estudiante',
        onboarding_completo: false,
      };
      profiles.push(profile);
      writeJson(USERS_KEY, profiles);
      writeJson(PASSWORDS_KEY, { ...readJson(PASSWORDS_KEY, {}), [normalizedEmail]: password });
      return { data: { user: { id: profile.id, email: profile.email } }, error: null };
    },
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      return { error: null };
    },
  },
  from(table) {
    return new LocalQuery(table);
  },
  storage: {
    from(bucket) {
      return {
        async list(folder = '') {
          const files = await runFileTransaction('readonly', store => store.getAll());
          const prefix = `${bucket}/${folder ? `${folder}/` : ''}`;
          return { data: files.filter(file => file.path.startsWith(prefix)).map(file => ({ name: file.path.slice(prefix.length), created_at: file.createdAt })), error: null };
        },
        async download(path) {
          const file = await runFileTransaction('readonly', store => store.get(`${bucket}/${path}`));
          return file
            ? { data: file.blob, error: null }
            : { data: null, error: new Error('No se encontró el archivo local.') };
        },
        async upload(path, file, { upsert = false } = {}) {
          const key = `${bucket}/${path}`;
          const existing = await runFileTransaction('readonly', store => store.get(key));
          if (existing && !upsert) return { error: new Error('El archivo ya existe.') };
          await runFileTransaction('readwrite', store => store.put({ path: key, blob: file, createdAt: new Date().toISOString() }));
          return { error: null };
        },
      };
    },
  },
};

getProfiles();
window.demoStore = demoStore;
