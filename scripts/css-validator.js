const fs = require("fs")
const path = require("path")

console.log("🔍 Comprehensive CSS Validation for Dopamind App\n")

function validateCSSFile(filePath) {
  console.log(`📄 Checking: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    return false
  }

  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  let hasErrors = false
  let fixedContent = content

  // Patterns to detect malformed Tailwind classes
  const problematicPatterns = [
    {
      pattern: /sm:[a-zA-Z0-9\-[\]]+lg:/g,
      description: "Missing space between sm: and lg: classes",
      fix: (match) => match.replace(/lg:/, " lg:"),
    },
    {
      pattern: /md:[a-zA-Z0-9\-[\]]+lg:/g,
      description: "Missing space between md: and lg: classes",
      fix: (match) => match.replace(/lg:/, " lg:"),
    },
    {
      pattern: /lg:[a-zA-Z0-9\-[\]]+xl:/g,
      description: "Missing space between lg: and xl: classes",
      fix: (match) => match.replace(/xl:/, " xl:"),
    },
    {
      pattern: /xl:[a-zA-Z0-9\-[\]]+2xl:/g,
      description: "Missing space between xl: and 2xl: classes",
      fix: (match) => match.replace(/2xl:/, " 2xl:"),
    },
    {
      pattern: /\][a-zA-Z]/g,
      description: "Missing space after arbitrary value bracket",
      fix: (match) => match.replace(/\]([a-zA-Z])/, "] $1"),
    },
  ]

  lines.forEach((line, index) => {
    const lineNum = index + 1

    // Check for @apply directives
    if (line.includes("@apply")) {
      const applyMatch = line.match(/@apply\s+([^;]+);/)
      if (applyMatch) {
        const classes = applyMatch[1].trim()

        // Check each problematic pattern
        problematicPatterns.forEach(({ pattern, description, fix }) => {
          const matches = classes.match(pattern)
          if (matches) {
            console.log(`❌ Line ${lineNum}: ${description}`)
            console.log(`   Found: "${classes}"`)
            hasErrors = true

            // Apply fix to the content
            matches.forEach((match) => {
              const fixed = fix(match)
              fixedContent = fixedContent.replace(match, fixed)
            })
          }
        })

        // Check for the specific error mentioned
        if (classes.includes("sm:min-w-[120px]lg:min-w-[140px]")) {
          console.log(`❌ Line ${lineNum}: Found the exact error from the issue`)
          console.log(`   Current: "${classes}"`)
          console.log(`   Should be: "sm:min-w-[120px] lg:min-w-[140px]"`)
          hasErrors = true
        }
      }
    }
  })

  // Apply fixes if any were found
  if (hasErrors && fixedContent !== content) {
    console.log(`🔧 Applying fixes to ${filePath}...`)
    fs.writeFileSync(filePath, fixedContent, "utf8")
    console.log(`✅ Fixed CSS spacing issues in ${filePath}`)
  } else if (!hasErrors) {
    console.log(`✅ No issues found in ${filePath}`)
  }

  return !hasErrors
}

function validateTailwindConfig() {
  console.log("\n🎯 Checking Tailwind Configuration...")

  const configPaths = ["tailwind.config.ts", "tailwind.config.js"]
  let configFound = false

  configPaths.forEach((configPath) => {
    if (fs.existsSync(configPath)) {
      configFound = true
      console.log(`✅ Found ${configPath}`)

      const config = fs.readFileSync(configPath, "utf8")

      // Check for proper content paths
      if (config.includes("content:")) {
        console.log("✅ Content paths configured")
      } else {
        console.log("⚠️  Content paths may not be configured")
      }

      // Check for common issues
      if (config.includes("./app/**/*.{js,ts,jsx,tsx,mdx}")) {
        console.log("✅ App directory included in content paths")
      } else {
        console.log("⚠️  App directory may not be included in content paths")
      }
    }
  })

  if (!configFound) {
    console.log("❌ No Tailwind config found")
  }
}

function checkForCustomClasses() {
  console.log("\n🔍 Checking for custom classes that need @layer...")

  const globalsPath = "app/globals.css"
  if (!fs.existsSync(globalsPath)) {
    console.log("❌ globals.css not found")
    return
  }

  const content = fs.readFileSync(globalsPath, "utf8")

  // Check if custom classes are properly wrapped in @layer
  const customClassPattern = /^\s*\.[a-zA-Z][a-zA-Z0-9\-_]*\s*{/gm
  const layerPattern = /@layer\s+(base|components|utilities)/g

  const customClasses = content.match(customClassPattern) || []
  const layers = content.match(layerPattern) || []

  console.log(`Found ${customClasses.length} custom classes`)
  console.log(`Found ${layers.length} @layer directives`)

  if (customClasses.length > 0 && layers.length === 0) {
    console.log("⚠️  Custom classes found but no @layer directives")
    console.log("💡 Consider wrapping custom classes in @layer components or @layer utilities")
  } else {
    console.log("✅ Custom classes appear to be properly organized")
  }
}

// Main execution
const cssFiles = ["app/globals.css", "styles/globals.css"]

let allValid = true

cssFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const isValid = validateCSSFile(file)
    if (!isValid) {
      allValid = false
    }
  }
})

validateTailwindConfig()
checkForCustomClasses()

console.log("\n" + "=".repeat(50))
if (allValid) {
  console.log("🎉 All CSS files are valid!")
  console.log("✅ Your Dopamind app should now load without CSS errors")
} else {
  console.log("⚠️  Issues were found and fixed")
  console.log("🔄 Please restart your development server:")
  console.log("   1. Stop the server (Ctrl+C)")
  console.log("   2. Remove .next folder: rm -rf .next")
  console.log("   3. Restart: npm run dev")
}
