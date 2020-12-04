import Package from '../package.json'
import qs from 'querystring'
import fetch, { Headers } from 'node-fetch'

/**
 * dblstats API Client
 */
export default class DblStatsClient {
  private token: string
  /**
   * Creates a new DBL Stats Client intstance
   * @param token Your dblstats.com token
   */
  constructor (token: string) {
    this.token = token
  }

  private async _request (method: string, path: string, body?: object): Promise<any> {
    const headers = new Headers()
    headers.set('Authorization', this.token)
    headers.set('User-Agent', `DBLStats.js / ${Package.version}`)
    if (method !== 'GET') headers.set('Content-Type', 'application/json')

    let url = `https://dblstatistics.com/api/${path}`

    // @ts-ignore querystring typings are messed
    if (body && method === 'GET') url += `?${qs.stringify(body)}`

    const response = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' ? JSON.stringify(body) : null
    })

    let responseBody 
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      responseBody = await response.json()
    } else {
      responseBody = await response.text()
    }

    if (!response.ok) throw new Error(`DBLStats in request ${response.status} : ${response.statusText}`)

    return responseBody
  }

  /**
   * Gets a bots current information
   * @param id ID of the bot
   * @returns Bot information
   */
  public async getBot (id: Snowflake): Promise<Bot> {
    if (!id) throw new Error('Missing ID')
    return this._request('GET', `/bots/${id}`)
  }

  /**
   * Fetch previous bot data, each packet is an hour apart
   * @param id ID of the bot
   * @param limit Amount of responses (default = 500)
   * @returns An array of bot information an hour apart
   */
  public async getBotHistory (id: Snowflake, limit?: number): Promise<Bot[]> {
    if (!id) throw new Error('Missing ID')
    return this._request('GET', `/bots/${id}/previous`, { limit }).then(x => x.data)
  }

  /**
   * Get the top bots for a specific metric
   * @param by For which metric
   * @param limit Amount of responses
   * @returns Array of top bots for that metric
   */
  public async getTop(by: LeaderboardType, limit?: number): Promise<Bot[]> {
    if (!by) throw new Error('Missing sortBy')
    return this._request('GET', '/bots/top', { sortby: by, limit })
  }

  /**
   * Get the bots that a user owns
   * @param id The User's ID
   * @return An array of bots the user is owner on
   */
  public async getUsersBots (id: Snowflake): Promise<{ user: User, bots: Bot[] }> {
    if (!id) throw new Error('Missing ID')
    return this._request('GET', `/users/${id}/bots`)
  }

  /**
   * Get all auction tags
   * @returns Strings of tags, response.bot is bot tags and response.server is server tags
   */
  public async getTags (): Promise<{ bot: string[], server: string[] }> {
    return this._request('GET', '/auctions/tags')
  }
}