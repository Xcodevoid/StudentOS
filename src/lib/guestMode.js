const KEY = 'studentos.guestMode'

export function getGuestMode() {
  return localStorage.getItem(KEY) === 'true'
}

export function setGuestMode(value) {
  if (value) localStorage.setItem(KEY, 'true')
  else localStorage.removeItem(KEY)
}
