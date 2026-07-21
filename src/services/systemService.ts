import { httpClient } from './httpClient'

export const systemService = {
  healthCheck: () => httpClient.get('/actuator/health'),
}
