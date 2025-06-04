const fs = require("fs")
const path = require("path")

console.log("🔍 Enhanced CSS Validator for Digital Detox App\n")

function validateTailwindSyntax(filePath) {
  console.log(`📄 Validating: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`)
    return false
  }

  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  let hasErrors = false
  let fixedContent = content

  // Enhanced patterns to detect malformed Tailwind classes
  const problematicPatterns = [
    {
      pattern: /sm:[a-zA-Z0-9\-[\]]+md:/g,
      description: "Missing space between sm: and md: classes",
      fix: (match) => match.replace(/md:/, " md:"),
    },
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
    {
      pattern: /[a-zA-Z0-9]\[/g,
      description: "Potential missing space before arbitrary value",
      fix: (match) => match.replace(/([a-zA-Z0-9])\[/, "$1 ["),
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
              console.log(`   Fixed: "${match}" → "${fixed}"`)
            })
          }
        })

        // Check for the specific error mentioned in the issue
        if (classes.includes("sm:min-w-[120px]lg:min-w-[140px]")) {
          console.log(`❌ Line ${lineNum}: Found the exact error - missing space in responsive classes`)
          console.log(`   Current: "${classes}"`)
          console.log(`   Should be: "w-full sm:w-auto sm:min-w-[120px] lg:min-w-[140px]"`)
          hasErrors = true

          // Fix this specific issue
          fixedContent = fixedContent.replace("sm:min-w-[120px]lg:min-w-[140px]", "sm:min-w-[120px] lg:min-w-[140px]")
        }
      }
    }
  })

  // Apply fixes if any were found
  if (hasErrors && fixedContent !== content) {
    console.log(`🔧 Applying fixes to ${filePath}...`)
    fs.writeFileSync(filePath, fixedContent, "utf8")
    console.log(`✅ Fixed CSS spacing issues in ${filePath}`)

    // Verify the fix
    const verifyContent = fs.readFileSync(filePath, "utf8")
    const stillHasIssues = problematicPatterns.some(({ pattern }) => pattern.test(verifyContent))

    if (!stillHasIssues) {
      console.log(`✅ Verification successful: All CSS spacing issues have been fixed`)
    } else {
      console.log(`⚠️ Verification warning: Some issues may still exist`)
    }
  } else if (!hasErrors) {
    console.log(`✅ No issues found in ${filePath}`)
  }

  console.log("")
  return !hasErrors
}

function validateResponsiveClasses() {
  console.log("🎯 Validating Responsive Class Usage...\n")

  const testCases = [
    {
      name: "Correct responsive button",
      classes: "w-full sm:w-auto sm:min-w-[120px] lg:min-w-[140px]",
      expected: true,
    },
    {
      name: "Incorrect responsive button (missing space)",
      classes: "w-full sm:w-auto sm:min-w-[120px]lg:min-w-[140px]",
      expected: false,
    },
    {
      name: "Complex responsive layout",
      classes: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      expected: true,
    },
    {
      name: "Incorrect complex layout (missing space)",
      classes: "grid grid-cols-1 sm:grid-cols-2lg:grid-cols-3 xl:grid-cols-4",
      expected: false,
    },
  ]

  testCases.forEach(({ name, classes, expected }) => {
    console.log(`Testing: ${name}`)
    console.log(`Classes: "${classes}"`)

    // Check for spacing issues
    const hasSpacingIssues =
      /[a-zA-Z0-9\]][a-zA-Z]/.test(classes) || /[a-zA-Z0-9][a-zA-Z]+:/.test(classes.replace(/^[a-zA-Z0-9-]+:/, ""))

    const isValid = !hasSpacingIssues
    const result = isValid === expected ? "✅ PASS" : "❌ FAIL"

    console.log(`Result: ${result} (Valid: ${isValid}, Expected: ${expected})`)
    console.log("")
  })
}

function generateCSSBestPractices() {
  console.log("📚 CSS Best Practices for Digital Detox App\n")

  const bestPractices = [
    {
      title: "Responsive Button Classes",
      correct: "@apply w-full sm:w-auto sm:min-w-[120px] lg:min-w-[140px];",
      incorrect: "@apply w-full sm:w-auto sm:min-w-[120px]lg:min-w-[140px];",
      explanation: "Always add spaces between responsive prefixes and utility classes",
    },
    {
      title: "Grid Responsive Layout",
      correct: "@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3;",
      incorrect: "@apply grid grid-cols-1 sm:grid-cols-2lg:grid-cols-3;",
      explanation: "Separate each responsive variant with a space",
    },
    {
      title: "Arbitrary Values",
      correct: "@apply w-full sm:w-[200px] lg:w-[300px];",
      incorrect: "@apply w-full sm:w-[200px]lg:w-[300px];",
      explanation: "Space is required after arbitrary values before the next class",
    },
    {
      title: "Complex Responsive Design",
      correct: "@apply text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl;",
      incorrect: "@apply text-sm sm:text-basemd:text-lg lg:text-xlxl:text-2xl;",
      explanation: "Each breakpoint must be separated by spaces",
    },
  ]

  bestPractices.forEach(({ title, correct, incorrect, explanation }, index) => {
    console.log(`${index + 1}. ${title}`)
    console.log(`   ✅ Correct:   ${correct}`)
    console.log(`   ❌ Incorrect: ${incorrect}`)
    console.log(`   💡 Tip: ${explanation}`)
    console.log("")
  })
}

// Main execution
console.log("Starting enhanced CSS validation for digital detox app...\n")

// Validate main CSS files
const cssFiles = ["app/globals.css"]
let allValid = true

cssFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const isValid = validateTailwindSyntax(file)
    if (!isValid) {
      allValid = false
    }
  } else {
    console.log(`⚠️ CSS file not found: ${file}`)
  }
})

// Run responsive class validation tests
validateResponsiveClasses()

// Show best practices
generateCSSBestPractices()

// Final summary
console.log("=".repeat(60))
console.log("📊 VALIDATION SUMMARY")
console.log("=".repeat(60))

if (allValid) {
  console.log("🎉 SUCCESS! All CSS files are valid and properly formatted")
  console.log("✅ Responsive classes have proper spacing")
  console.log("✅ @apply directives are correctly structured")
  console.log("✅ Your digital detox app UI should render correctly")
  console.log("\n🚀 Next steps:")
  console.log("   1. Clear build cache: rm -rf .next")
  console.log("   2. Restart dev server: npm run dev")
  console.log("   3. Test responsive behavior on different screen sizes")
} else {
  console.log("⚠️ Issues were found and automatically fixed")
  console.log("🔄 Please restart your development server:")
  console.log("   1. Stop the server (Ctrl+C)")
  console.log("   2. Clear build cache: rm -rf .next")
  console.log("   3. Restart: npm run dev")
  console.log("   4. Hard refresh browser: Ctrl+Shift+R")
}

console.log("\n📱 Test your responsive UI on:")
console.log("   - Mobile: < 768px")
console.log("   - Tablet: 768px - 1024px")
console.log("   - Desktop: > 1024px")
