const fs = require("fs")
const path = require("path")

console.log("🔧 Running CSS Spacing Fix Script")

// Path to the globals.css file
const cssFilePath = path.join(process.cwd(), "app/globals.css")

// Check if the file exists
if (!fs.existsSync(cssFilePath)) {
  console.error("❌ Error: globals.css file not found at", cssFilePath)
  process.exit(1)
}

// Read the file content
let cssContent = fs.readFileSync(cssFilePath, "utf8")
console.log("📄 Read globals.css file")

// Check if the problematic pattern exists
const problematicPattern = /sm:min-w-\[120px\]lg:min-w-\[140px\]/g
if (cssContent.match(problematicPattern)) {
  console.log("🔍 Found problematic CSS pattern: missing space between responsive classes")

  // Fix the spacing issue
  cssContent = cssContent.replace(problematicPattern, "sm:min-w-[120px] lg:min-w-[140px]")

  // Write the fixed content back to the file
  fs.writeFileSync(cssFilePath, cssContent, "utf8")
  console.log("✅ Fixed CSS spacing issue in btn-responsive class")

  // Verify the fix
  const verifyContent = fs.readFileSync(cssFilePath, "utf8")
  if (!verifyContent.match(problematicPattern)) {
    console.log("✅ Verification successful: CSS spacing issue has been fixed")
  } else {
    console.log("❌ Verification failed: CSS spacing issue still exists")
  }
} else {
  console.log("🔍 Problematic pattern not found in the current file")

  // Check for the fixed pattern
  const fixedPattern = /sm:min-w-\[120px\] lg:min-w-\[140px\]/g
  if (cssContent.match(fixedPattern)) {
    console.log("✅ The CSS already contains the fixed pattern")
  } else {
    console.log("⚠️ Neither problematic nor fixed pattern found")

    // Search for any btn-responsive class
    const btnResponsivePattern = /\.btn-responsive\s*\{[^}]*\}/g
    const btnResponsiveMatch = cssContent.match(btnResponsivePattern)

    if (btnResponsiveMatch) {
      console.log("📌 Found btn-responsive class:")
      console.log(btnResponsiveMatch[0])
    } else {
      console.log("❌ btn-responsive class not found in the CSS")
    }
  }
}

// Check for any other potential spacing issues
const otherProblematicPatterns = [
  { pattern: /sm:[a-zA-Z0-9\-[\]]+md:/g, desc: "sm: and md:" },
  { pattern: /sm:[a-zA-Z0-9\-[\]]+lg:/g, desc: "sm: and lg:" },
  { pattern: /md:[a-zA-Z0-9\-[\]]+lg:/g, desc: "md: and lg:" },
  { pattern: /lg:[a-zA-Z0-9\-[\]]+xl:/g, desc: "lg: and xl:" },
  { pattern: /xl:[a-zA-Z0-9\-[\]]+2xl:/g, desc: "xl: and 2xl:" },
]

console.log("\n🔍 Checking for other potential spacing issues...")
let otherIssuesFound = false

otherProblematicPatterns.forEach(({ pattern, desc }) => {
  const matches = cssContent.match(pattern)
  if (matches) {
    otherIssuesFound = true
    console.log(`⚠️ Found potential spacing issue between ${desc}:`)
    matches.forEach((match) => {
      console.log(`   ${match}`)

      // Fix this issue too
      const fixed = match.replace(/([a-z0-9\]])([a-z])/i, "$1 $2")
      cssContent = cssContent.replace(match, fixed)
    })
  }
})

if (otherIssuesFound) {
  // Write the fixed content back to the file
  fs.writeFileSync(cssFilePath, cssContent, "utf8")
  console.log("✅ Fixed additional CSS spacing issues")
} else {
  console.log("✅ No other spacing issues found")
}

console.log("\n🧹 CSS cleanup complete!")
console.log("🔄 Please restart your development server and clear the cache:")
console.log("   1. Stop the server (Ctrl+C)")
console.log("   2. Remove .next folder: rm -rf .next")
console.log("   3. Restart: npm run dev")
console.log("   4. Hard refresh browser: Ctrl+Shift+R or Cmd+Shift+R")
