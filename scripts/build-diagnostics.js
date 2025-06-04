const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🔍 Dopamind Build Process Diagnostics\n")

// Check Next.js configuration
function checkNextConfig() {
  console.log("📋 Checking Next.js Configuration...")

  const nextConfigPath = path.join(process.cwd(), "next.config.js")
  const nextConfigMjsPath = path.join(process.cwd(), "next.config.mjs")

  if (fs.existsSync(nextConfigPath)) {
    console.log("✅ Found next.config.js")
    const config = fs.readFileSync(nextConfigPath, "utf8")
    console.log("📄 Configuration:", config.substring(0, 200) + "...")
  } else if (fs.existsSync(nextConfigMjsPath)) {
    console.log("✅ Found next.config.mjs")
    const config = fs.readFileSync(nextConfigMjsPath, "utf8")
    console.log("📄 Configuration:", config.substring(0, 200) + "...")
  } else {
    console.log("⚠️  No Next.js config found - using defaults")
  }
  console.log("")
}

// Check PostCSS configuration
function checkPostCSSConfig() {
  console.log("🎨 Checking PostCSS Configuration...")

  const postcssConfigPath = path.join(process.cwd(), "postcss.config.js")
  const postcssConfigMjsPath = path.join(process.cwd(), "postcss.config.mjs")

  if (fs.existsSync(postcssConfigPath)) {
    console.log("✅ Found postcss.config.js")
    const config = fs.readFileSync(postcssConfigPath, "utf8")
    console.log("📄 Configuration:", config)
  } else if (fs.existsSync(postcssConfigMjsPath)) {
    console.log("✅ Found postcss.config.mjs")
    const config = fs.readFileSync(postcssConfigMjsPath, "utf8")
    console.log("📄 Configuration:", config)
  } else {
    console.log("⚠️  No PostCSS config found - using defaults")
  }
  console.log("")
}

// Check Tailwind configuration
function checkTailwindConfig() {
  console.log("🎯 Checking Tailwind Configuration...")

  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts")
  const tailwindConfigJsPath = path.join(process.cwd(), "tailwind.config.js")

  if (fs.existsSync(tailwindConfigPath)) {
    console.log("✅ Found tailwind.config.ts")
    const config = fs.readFileSync(tailwindConfigPath, "utf8")

    // Check for potential issues
    if (config.includes("content:")) {
      console.log("✅ Content paths configured")
    } else {
      console.log("❌ Missing content paths configuration")
    }

    if (config.includes("plugins:")) {
      console.log("✅ Plugins section found")
    }
  } else if (fs.existsSync(tailwindConfigJsPath)) {
    console.log("✅ Found tailwind.config.js")
  } else {
    console.log("❌ No Tailwind config found")
  }
  console.log("")
}

// Check CSS files for potential issues
function checkCSSFiles() {
  console.log("📝 Checking CSS Files...")

  const globalsPath = path.join(process.cwd(), "app/globals.css")

  if (fs.existsSync(globalsPath)) {
    console.log("✅ Found app/globals.css")
    const css = fs.readFileSync(globalsPath, "utf8")

    // Check for common issues
    const issues = []

    // Check for missing spaces in class definitions
    const classRegex = /@apply\s+([^;]+);/g
    let match
    while ((match = classRegex.exec(css)) !== null) {
      const classes = match[1]
      // Look for potential missing spaces between classes
      if (classes.includes("][") || classes.includes("px]lg:") || classes.includes("sm]lg:")) {
        issues.push(`Potential missing space in: ${classes}`)
      }
    }

    if (issues.length > 0) {
      console.log("⚠️  Potential CSS issues found:")
      issues.forEach((issue) => console.log(`   - ${issue}`))
    } else {
      console.log("✅ No obvious CSS syntax issues found")
    }

    // Check for Tailwind directives
    if (css.includes("@tailwind base")) console.log("✅ @tailwind base found")
    if (css.includes("@tailwind components")) console.log("✅ @tailwind components found")
    if (css.includes("@tailwind utilities")) console.log("✅ @tailwind utilities found")
  } else {
    console.log("❌ globals.css not found")
  }
  console.log("")
}

// Check package.json scripts
function checkPackageScripts() {
  console.log("📋 Checking Package Scripts...")

  const packagePath = path.join(process.cwd(), "package.json")
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

    console.log("✅ Build script:", packageJson.scripts?.build || "Not found")
    console.log("✅ Dev script:", packageJson.scripts?.dev || "Not found")
    console.log("✅ Start script:", packageJson.scripts?.start || "Not found")

    // Check for CSS-related dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    console.log("\n📦 CSS-related dependencies:")
    Object.keys(deps).forEach((dep) => {
      if (dep.includes("css") || dep.includes("tailwind") || dep.includes("postcss")) {
        console.log(`   - ${dep}: ${deps[dep]}`)
      }
    })
  }
  console.log("")
}

// Simplified build test (without actually running build)
function testBuildConfiguration() {
  console.log("🔨 Testing Build Configuration...")

  try {
    // Check if .next directory exists from previous builds
    const nextDir = path.join(process.cwd(), ".next")
    if (fs.existsSync(nextDir)) {
      console.log("✅ .next directory found (from previous build)")

      // Check for CSS files in build output
      const staticDir = path.join(nextDir, "static")
      if (fs.existsSync(staticDir)) {
        console.log("✅ Static directory found")

        // Look for CSS files
        const findCSSFiles = (dir) => {
          const files = []
          try {
            const items = fs.readdirSync(dir)

            for (const item of items) {
              const fullPath = path.join(dir, item)
              const stat = fs.statSync(fullPath)

              if (stat.isDirectory()) {
                files.push(...findCSSFiles(fullPath))
              } else if (item.endsWith(".css")) {
                files.push(fullPath)
              }
            }
          } catch (error) {
            // Skip directories we can't read
          }

          return files
        }

        const cssFiles = findCSSFiles(staticDir)
        console.log(`✅ Found ${cssFiles.length} CSS files in previous build output`)

        // Check first CSS file for minification
        if (cssFiles.length > 0) {
          const firstCSSFile = cssFiles[0]
          const cssContent = fs.readFileSync(firstCSSFile, "utf8")

          if (cssContent.includes("\n") && cssContent.includes("  ")) {
            console.log("⚠️  CSS appears to be unminified (contains newlines and spaces)")
          } else {
            console.log("✅ CSS appears to be minified")
          }

          // Check for the problematic class
          if (cssContent.includes("btn-responsive")) {
            console.log("✅ btn-responsive class found in build output")
          } else {
            console.log("⚠️  btn-responsive class not found in build output")
          }

          // Show a sample of the CSS
          console.log("📄 CSS Sample (first 200 chars):")
          console.log(cssContent.substring(0, 200) + "...")
        }
      } else {
        console.log("⚠️  No static directory found in .next")
      }
    } else {
      console.log("⚠️  No .next directory found - run 'npm run build' first")
    }
  } catch (error) {
    console.log("❌ Error checking build output:")
    console.log(error.message)
  }
  console.log("")
}

// Run all diagnostics
async function runDiagnostics() {
  try {
    checkNextConfig()
    checkPostCSSConfig()
    checkTailwindConfig()
    checkCSSFiles()
    checkPackageScripts()
    testBuildConfiguration()

    console.log("🎉 Diagnostics completed!")
    console.log("\n💡 Recommendations:")
    console.log("   - Ensure all CSS classes have proper spacing")
    console.log("   - Check that Tailwind content paths include all relevant files")
    console.log("   - Verify PostCSS plugins are configured correctly")
    console.log("   - Consider adding CSS linting to catch syntax errors")
    console.log("   - Run 'npm run build' to generate fresh build output for analysis")
  } catch (error) {
    console.error("❌ Diagnostics failed:", error.message)
  }
}

runDiagnostics()
