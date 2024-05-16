export function generateUUID() {
  // Get current time in milliseconds
  let d = new Date().getTime()

  // Define the UUID template with placeholder characters
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

  // Replace the placeholders with random hexadecimal digits
  uuid = uuid.replace(/[xy]/g, function (c) {
    // Generate a random number between 0 and 15
    const r = (d + Math.random() * 16) % 16 | 0

    // Update value of d for the next placeholder
    d = Math.floor(d / 16)

    // Convert the number to a hexadecimal digit and return it
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })

  return uuid
}

export function isUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}
