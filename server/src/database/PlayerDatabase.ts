import { v4 as uuidv4 } from 'uuid'
import Database from './Database'
import Language from '@shared/enums/Language'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'
import RenderQuality from '@shared/enums/RenderQuality'
import AccessLevel from '@shared/enums/AccessLevel'

export default {
	async insertPlayer(email: string, username: string, passwordHash: string): Promise<boolean> {
		const playerId = uuidv4()
		const query = `INSERT INTO players (id, email, username, "passwordHash") VALUES('${playerId}', '${email}', '${username}', '${passwordHash}');`
		return Database.insertRow(query)
	},

	async selectPlayerById(id: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE id = '${id}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerByEmail(email: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE email = '${email}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerWithPasswordByEmail(email: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT * FROM players WHERE email = '${email}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectPlayerByUsername(username: string): Promise<PlayerDatabaseEntry | null> {
		const query = `SELECT *, '[Redacted]' as "passwordHash" FROM players WHERE username = '${username}'`
		return Database.selectRow<PlayerDatabaseEntry>(query)
	},

	async selectAllPlayers(): Promise<PlayerDatabaseEntry[] | null> {
		const query = 'SELECT *, \'[Redacted]\' as "passwordHash" FROM players ORDER BY players."accessedAt" DESC LIMIT 500'
		return Database.selectRows<PlayerDatabaseEntry>(query)
	},

	async updatePlayerUsername(id: string, username: string): Promise<boolean> {
		const query = `UPDATE players SET "username" = '${username}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerPassword(id: string, passwordHash: string): Promise<boolean> {
		const query = `UPDATE players SET "passwordHash" = '${passwordHash}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerAccessLevel(id: string, accessLevel: AccessLevel): Promise<boolean> {
		const query = `UPDATE players SET "accessLevel" = '${accessLevel}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerUserLanguage(id: string, userLanguage: Language): Promise<boolean> {
		const query = `UPDATE players SET "userLanguage" = '${userLanguage}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerRenderQuality(id: string, renderQuality: RenderQuality): Promise<boolean> {
		const query = `UPDATE players SET "renderQuality" = '${renderQuality}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerMasterVolume(id: string, masterVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "masterVolume" = '${masterVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerMusicVolume(id: string, musicVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "musicVolume" = '${musicVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerEffectsVolume(id: string, effectsVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "effectsVolume" = '${effectsVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerAmbienceVolume(id: string, ambienceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "ambienceVolume" = '${ambienceVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerUserInterfaceVolume(id: string, userInterfaceVolume: number): Promise<boolean> {
		const query = `UPDATE players SET "userInterfaceVolume" = '${userInterfaceVolume}' WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerWelcomeModalSeenAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "welcomeModalSeenAt" = current_timestamp WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerMobileModalSeenAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "mobileModalSeenAt" = current_timestamp WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async updatePlayerAccessedAt(id: string): Promise<boolean> {
		const query = `UPDATE players SET "accessedAt" = current_timestamp WHERE id = '${id}'`
		return Database.updateRows(query)
	},

	async deletePlayer(id: string): Promise<boolean> {
		const query = `DELETE FROM players WHERE id = '${id}'`
		return Database.deleteRows(query)
	},
}
