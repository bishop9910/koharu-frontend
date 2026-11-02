import http from '@/utils/request'

export function getApiInfo() {
  return http.get<string>('')
}
