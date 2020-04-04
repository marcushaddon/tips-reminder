module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    testMatch: [
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "coverageReporters": [
      "lcov",
      "text",
      "text-summary",
      "json",
      "json-summary"
    ]
  }
  