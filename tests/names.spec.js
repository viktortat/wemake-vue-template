// Tests for template names integrity

const fs = require('fs')
const path = require('path')

function templatePath (subPath) {
  return path.resolve(__dirname, '..', 'template', subPath)
}

describe('template names', () => {
  test('package.json', () => {
    const file = JSON.parse(fs.readFileSync(templatePath('package.json')))

    const patterns = {
      name: '{{ name }}',
      author: '{{ author }}',
      description: '{{ description }}',
      version: '0.1.0',
      private: true
    }

    for (const key in patterns) {
      expect(file[key]).toEqual(patterns[key])
    }
  })
})