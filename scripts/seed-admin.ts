import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')

loadEnv({ path: resolve(repoRoot, '.env') })
loadEnv({ path: resolve(repoRoot, '.env.local'), override: true })

import { hash } from 'bcryptjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { adminUsersTable } from '../lib/db/schema/admin-users'

const BCRYPT_ROUNDS = 12

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/seed-admin.ts <email> <password>')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Add it to .env or .env.local.')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool)

  const passwordHash = await hash(password, BCRYPT_ROUNDS)

  const [user] = await db
    .insert(adminUsersTable)
    .values({ email: email.trim().toLowerCase(), passwordHash })
    .onConflictDoUpdate({
      target: adminUsersTable.email,
      set: { passwordHash },
    })
    .returning({ id: adminUsersTable.id, email: adminUsersTable.email })

  console.log(`Admin user ready: ${user.email} (${user.id})`)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
