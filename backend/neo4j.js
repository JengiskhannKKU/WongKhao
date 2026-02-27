import neo4j from 'neo4j-driver';

let driver;

export function hasNeo4jConfig() {
  return Boolean(process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD);
}

export function getNeo4jDatabase() {
  return process.env.NEO4J_DATABASE || 'neo4j';
}

export function getNeo4jDriver() {
  if (!hasNeo4jConfig()) {
    throw new Error('Neo4j config missing. Set NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD.');
  }

  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
      {
        maxConnectionLifetime: 3 * 60 * 1000,
      }
    );
  }

  return driver;
}

export async function verifyNeo4j() {
  await getNeo4jDriver().verifyConnectivity();
}

export async function closeNeo4j() {
  if (driver) {
    await driver.close();
    driver = undefined;
  }
}

export async function runWrite(work) {
  const session = getNeo4jDriver().session({
    database: getNeo4jDatabase(),
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    return await session.executeWrite(work);
  } finally {
    await session.close();
  }
}

export async function runRead(work) {
  const session = getNeo4jDriver().session({
    database: getNeo4jDatabase(),
    defaultAccessMode: neo4j.session.READ,
  });

  try {
    return await session.executeRead(work);
  } finally {
    await session.close();
  }
}

export function normalizeNeo4jValue(value) {
  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeNeo4jValue);
  }

  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = normalizeNeo4jValue(nested);
    }
    return result;
  }

  return value;
}

export function normalizeRecords(records) {
  return records.map((record) => {
    const row = {};
    for (const key of record.keys) {
      row[key] = normalizeNeo4jValue(record.get(key));
    }
    return row;
  });
}
