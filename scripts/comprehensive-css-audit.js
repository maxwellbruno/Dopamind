const fs = require("fs")
const path = require("path")

console.log("🔍 Comprehensive CSS Audit - Checking All App Pages\n")

// Get all TypeScript/JavaScript files in the app
function getAllAppFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getAllAppFiles(filePath, fileList)
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// Check for problematic className patterns
function checkClassNameSyntax(content, filePath) {
  const issues = []
  const lines = content.split("\n")

  lines.forEach((line, index) => {
    const lineNum = index + 1

    // Look for className attributes
    const classNameMatches = line.match(/className\s*=\s*["'`]([^"'`]+)["'`]/g)
    if (classNameMatches) {
      classNameMatches.forEach((match) => {
        const classes = match.replace(/className\s*=\s*["'`]/, "").replace(/["'`]$/, "")

        // Check for missing spaces between responsive prefixes
        const problematicPatterns = [
          { pattern: /sm:[a-zA-Z0-9\-[\]]+md:/, desc: "Missing space between sm: and md:" },
          { pattern: /sm:[a-zA-Z0-9\-[\]]+lg:/, desc: "Missing space between sm: and lg:" },
          { pattern: /md:[a-zA-Z0-9\-[\]]+lg:/, desc: "Missing space between md: and lg:" },
          { pattern: /lg:[a-zA-Z0-9\-[\]]+xl:/, desc: "Missing space between lg: and xl:" },
          { pattern: /xl:[a-zA-Z0-9\-[\]]+2xl:/, desc: "Missing space between xl: and 2xl:" },
          { pattern: /\][a-zA-Z]/, desc: "Missing space after arbitrary value bracket" },
          { pattern: /[a-zA-Z]\[/, desc: "Potential missing space before arbitrary value" },
        ]

        problematicPatterns.forEach(({ pattern, desc }) => {
          if (pattern.test(classes)) {
            issues.push({
              file: filePath,
              line: lineNum,
              issue: desc,
              content: classes,
              fullLine: line.trim(),
            })
          }
        })

        // Check for duplicate classes
        const classArray = classes.split(/\s+/).filter((c) => c.length > 0)
        const duplicates = classArray.filter((item, index) => classArray.indexOf(item) !== index)
        if (duplicates.length > 0) {
          issues.push({
            file: filePath,
            line: lineNum,
            issue: "Duplicate classes found",
            content: duplicates.join(", "),
            fullLine: line.trim(),
          })
        }

        // Check for conflicting classes
        const conflicts = [
          { classes: ["hidden", "block", "inline", "flex", "grid"], type: "display" },
          { classes: ["static", "relative", "absolute", "fixed", "sticky"], type: "position" },
          { classes: ["text-left", "text-center", "text-right", "text-justify"], type: "text-align" },
        ]

        conflicts.forEach(({ classes: conflictClasses, type }) => {
          const found = conflictClasses.filter((c) => classArray.includes(c))
          if (found.length > 1) {
            issues.push({
              file: filePath,
              line: lineNum,
              issue: `Conflicting ${type} classes`,
              content: found.join(", "),
              fullLine: line.trim(),
            })
          }
        })
      })
    }

    // Check for template literal className with potential issues
    const templateMatches = line.match(/className\s*=\s*`([^`]+)`/g)
    if (templateMatches) {
      templateMatches.forEach((match) => {
        // Look for potential concatenation issues
        if (match.includes("${") && match.includes("}")) {
          // This is a template literal with variables - check for spacing around variables
          const beforeVar = match.match(/[a-zA-Z0-9\]]\$\{/)
          const afterVar = match.match(/\}[a-zA-Z0-9[:]/)

          if (beforeVar) {
            issues.push({
              file: filePath,
              line: lineNum,
              issue: "Missing space before template variable",
              content: beforeVar[0],
              fullLine: line.trim(),
            })
          }

          if (afterVar) {
            issues.push({
              file: filePath,
              line: lineNum,
              issue: "Missing space after template variable",
              content: afterVar[0],
              fullLine: line.trim(),
            })
          }
        }
      })
    }
  })

  return issues
}

// Check specific files for known issues
function checkSpecificFiles() {
  console.log("🎯 Checking specific app pages...\n")

  const criticalFiles = [
    "app/page.tsx",
    "app/home/page.tsx",
    "app/focus/page.tsx",
    "app/mood/page.tsx",
    "app/profile/page.tsx",
    "app/auth/signin/page.tsx",
    "app/auth/signup/page.tsx",
    "app/onboarding/page.tsx",
    "components/bottom-nav.tsx",
    "components/layout/responsive-layout.tsx",
    "components/navigation/adaptive-navigation.tsx",
  ]

  let totalIssues = 0

  criticalFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      console.log(`📄 Checking ${filePath}...`)
      const content = fs.readFileSync(filePath, "utf8")
      const issues = checkClassNameSyntax(content, filePath)

      if (issues.length > 0) {
        console.log(`❌ Found ${issues.length} issue(s):`)
        issues.forEach((issue) => {
          console.log(`   Line ${issue.line}: ${issue.issue}`)
          console.log(`   Content: "${issue.content}"`)
          console.log(`   Full line: ${issue.fullLine}`)
          console.log("")
        })
        totalIssues += issues.length
      } else {
        console.log(`✅ No issues found`)
      }
      console.log("")
    } else {
      console.log(`⚠️  File not found: ${filePath}`)
      console.log("")
    }
  })

  return totalIssues
}

// Check all component files
function checkAllComponents() {
  console.log("🧩 Checking all component files...\n")

  const componentDirs = ["components", "app"]
  let totalIssues = 0

  componentDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = getAllAppFiles(dir)

      files.forEach((filePath) => {
        const content = fs.readFileSync(filePath, "utf8")
        const issues = checkClassNameSyntax(content, filePath)

        if (issues.length > 0) {
          console.log(`❌ ${filePath}: ${issues.length} issue(s)`)
          issues.forEach((issue) => {
            console.log(`   Line ${issue.line}: ${issue.issue} - "${issue.content}"`)
          })
          console.log("")
          totalIssues += issues.length
        }
      })
    }
  })

  if (totalIssues === 0) {
    console.log("✅ No issues found in component files")
  }

  return totalIssues
}

// Check for unused CSS classes
function checkUnusedClasses() {
  console.log("🧹 Checking for potentially unused custom CSS classes...\n")

  const globalsPath = "app/globals.css"
  if (!fs.existsSync(globalsPath)) {
    console.log("❌ globals.css not found")
    return
  }

  const cssContent = fs.readFileSync(globalsPath, "utf8")
  const customClasses = cssContent.match(/\.([\w-]+)\s*{/g) || []

  const classNames = customClasses.map((match) => match.replace(/^\./, "").replace(/\s*{$/, ""))

  console.log(`Found ${classNames.length} custom CSS classes`)

  // Check if these classes are used in any component files
  const allFiles = getAllAppFiles("app").concat(getAllAppFiles("components"))
  const allContent = allFiles.map((file) => fs.readFileSync(file, "utf8")).join(" ")

  const unusedClasses = classNames.filter((className) => {
    return !allContent.includes(className)
  })

  if (unusedClasses.length > 0) {
    console.log(`⚠️  Potentially unused classes: ${unusedClasses.join(", ")}`)
  } else {
    console.log("✅ All custom classes appear to be in use")
  }
}

// Main execution
console.log("Starting comprehensive CSS audit...\n")

const specificIssues = checkSpecificFiles()
const componentIssues = checkAllComponents()
checkUnusedClasses()

const totalIssues = specificIssues + componentIssues

console.log("\n" + "=".repeat(60))
console.log("📊 AUDIT SUMMARY")
console.log("=".repeat(60))

if (totalIssues === 0) {
  console.log("🎉 EXCELLENT! No CSS issues found across all app pages")
  console.log("✅ All Tailwind classes are properly formatted")
  console.log("✅ No conflicting or duplicate classes detected")
  console.log("✅ Template literals are properly spaced")
  console.log("\n💡 Your Dopamind app is ready for production!")
} else {
  console.log(`⚠️  Found ${totalIssues} total issues across all files`)
  console.log("\n🔧 Recommended actions:")
  console.log("1. Fix the spacing issues in className attributes")
  console.log("2. Remove duplicate classes")
  console.log("3. Resolve conflicting utility classes")
  console.log("4. Add proper spacing around template literal variables")
  console.log("5. Test each page after fixes")
}

console.log("\n📱 Pages to test manually:")
console.log("- / (Loading screen)")
console.log("- /auth/signup (Sign up)")
console.log("- /auth/signin (Sign in)")
console.log("- /onboarding (Onboarding flow)")
console.log("- /home (Main dashboard)")
console.log("- /focus (Focus timer)")
console.log("- /mood (Mood tracking)")
console.log("- /profile (User profile)")
console.log("- /test (Test suite)")

console.log("\n🔍 Check these on different screen sizes:")
console.log("- Mobile (< 768px)")
console.log("- Tablet (768px - 1024px)")
console.log("- Desktop (> 1024px)")
