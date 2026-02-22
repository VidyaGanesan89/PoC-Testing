package utility;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * TestNG Listener for capturing screenshots and generating HTML reports
 */
public class TestListener implements ITestListener {
    
    private List<TestResult> testResults = new ArrayList<>();
    private String reportDir = "functional test report";
    private String screenshotDir = "functional test screenshots";
    private long testStartTime;
    
    @Override
    public void onStart(ITestContext context) {
        System.out.println("=== Test Suite Started: " + context.getName() + " ===");
        testResults.clear();
    }
    
    @Override
    public void onTestStart(ITestResult result) {
        testStartTime = System.currentTimeMillis();
        System.out.println(">>> Test Started: " + result.getName());
    }
    
    @Override
    public void onTestSuccess(ITestResult result) {
        long duration = System.currentTimeMillis() - testStartTime;
        System.out.println("✓ Test Passed: " + result.getName());
        
        String screenshot = captureScreenshot(result, "PASSED");
        TestResult testResult = new TestResult(result.getName(), "PASSED", duration, screenshot, null);
        testResults.add(testResult);
        
        // Generate individual report immediately after test completes
        generateIndividualTestReport(result, testResult);
    }
    
    @Override
    public void onTestFailure(ITestResult result) {
        long duration = System.currentTimeMillis() - testStartTime;
        System.out.println("✗ Test Failed: " + result.getName());
        
        String screenshot = captureScreenshot(result, "FAILED");
        String error = result.getThrowable() != null ? result.getThrowable().getMessage() : "Unknown error";
        TestResult testResult = new TestResult(result.getName(), "FAILED", duration, screenshot, error);
        testResults.add(testResult);
        
        // Generate individual report immediately after test completes
        generateIndividualTestReport(result, testResult);
    }
    
    @Override
    public void onTestSkipped(ITestResult result) {
        long duration = System.currentTimeMillis() - testStartTime;
        System.out.println("⊘ Test Skipped: " + result.getName());
        
        TestResult testResult = new TestResult(result.getName(), "SKIPPED", duration, null, null);
        testResults.add(testResult);
        
        // Generate individual report immediately after test completes
        generateIndividualTestReport(result, testResult);
    }
    
    @Override
    public void onFinish(ITestContext context) {
        System.out.println("=== Test Suite Finished: " + context.getName() + " ===");
        generateHtmlReport(context);
    }
    
    /**
     * Capture screenshot on test completion
     */
    private String captureScreenshot(ITestResult result, String status) {
        try {
            WebDriver driver = Driver.instance;
            if (driver == null) {
                System.out.println("⚠ No WebDriver instance available for screenshot");
                return null;
            }
            
            // Create screenshots directory if it doesn't exist
            Path screenshotPath = Paths.get(screenshotDir);
            Files.createDirectories(screenshotPath);
            
            // Take screenshot
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            
            // Generate filename with timestamp
            String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
            String fileName = result.getName() + "_" + status + "_" + timestamp + ".png";
            Path destPath = screenshotPath.resolve(fileName);
            
            // Copy screenshot to destination
            Files.copy(srcFile.toPath(), destPath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("📸 Screenshot saved: " + destPath.toAbsolutePath());
            return fileName;
            
        } catch (Exception e) {
            System.err.println("❌ Failed to capture screenshot: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Generate individual test report immediately after each test execution
     */
    private void generateIndividualTestReport(ITestResult result, TestResult testResult) {
        try {
            // Create report directory
            Path reportPath = Paths.get(reportDir);
            Files.createDirectories(reportPath);
            
            // Generate report filename with test name and timestamp
            String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
            String testName = result.getName().replaceAll("[^a-zA-Z0-9]", "_");
            String fileName = testName + "_Report_" + timestamp + ".html";
            Path reportFile = reportPath.resolve(fileName);
            
            // Build HTML content for single test
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n<head>\n");
            html.append("  <meta charset='UTF-8'>\n");
            html.append("  <title>Test Report - " + result.getName() + "</title>\n");
            html.append("  <style>\n");
            html.append("    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n");
            html.append("    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }\n");
            html.append("    .summary { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n");
            html.append("    .summary-item { display: inline-block; margin-right: 30px; font-size: 18px; }\n");
            html.append("    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n");
            html.append("    th { background: #667eea; color: white; padding: 15px; text-align: left; }\n");
            html.append("    td { padding: 12px 15px; border-bottom: 1px solid #ddd; }\n");
            html.append("    .passed { color: #10b981; font-weight: bold; font-size: 24px; }\n");
            html.append("    .failed { color: #ef4444; font-weight: bold; font-size: 24px; }\n");
            html.append("    .skipped { color: #f59e0b; font-weight: bold; font-size: 24px; }\n");
            html.append("    .screenshot { max-width: 800px; cursor: pointer; border-radius: 5px; margin-top: 10px; }\n");
            html.append("    .error { color: #ef4444; font-size: 14px; background: #fee; padding: 10px; border-radius: 5px; margin-top: 10px; }\n");
            html.append("  </style>\n");
            html.append("</head>\n<body>\n");
            
            // Header
            html.append("  <div class='header'>\n");
            html.append("    <h1>🧪 Test Execution Report</h1>\n");
            html.append("    <p><strong>Test Name:</strong> " + result.getName() + "</p>\n");
            html.append("    <p><strong>Test Class:</strong> " + result.getTestClass().getName() + "</p>\n");
            html.append("    <p><strong>Executed:</strong> " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + "</p>\n");
            html.append("  </div>\n");
            
            // Summary
            html.append("  <div class='summary'>\n");
            html.append("    <h2>📊 Test Result</h2>\n");
            html.append("    <div class='summary-item'><strong>Status:</strong> <span class='" + testResult.status.toLowerCase() + "'>" + testResult.status + "</span></div>\n");
            html.append("    <div class='summary-item'><strong>Duration:</strong> " + testResult.duration + " ms</div>\n");
            html.append("  </div>\n");
            
            // Details
            html.append("  <div class='summary'>\n");
            html.append("    <h2>📝 Details</h2>\n");
            
            // Screenshot
            if (testResult.screenshot != null) {
                String screenshotPath = "../functional test screenshots/" + testResult.screenshot;
                html.append("    <p><strong>Screenshot:</strong></p>\n");
                html.append("    <a href='" + screenshotPath + "' target='_blank'><img src='" + screenshotPath + "' class='screenshot' alt='Test Screenshot'/></a>\n");
            }
            
            // Error details
            if (testResult.error != null) {
                html.append("    <p><strong>Error Message:</strong></p>\n");
                html.append("    <div class='error'>" + testResult.error + "</div>\n");
            }
            
            html.append("  </div>\n");
            html.append("</body>\n</html>");
            
            // Write to file
            try (FileWriter writer = new FileWriter(reportFile.toFile())) {
                writer.write(html.toString());
            }
            
            System.out.println("📄 Individual Test Report generated: " + reportFile.toAbsolutePath());
            
        } catch (IOException e) {
            System.err.println("❌ Failed to generate individual test report: " + e.getMessage());
        }
    }
    
    /**
     * Generate HTML report (Summary of all tests - generated at end)
     */
    private void generateHtmlReport(ITestContext context) {
        try {
            // Create report directory
            Path reportPath = Paths.get(reportDir);
            Files.createDirectories(reportPath);
            
            // Generate report filename
            String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
            String testName = context.getName().replaceAll("[^a-zA-Z0-9]", "_");
            String fileName = testName + "_Test_Report_" + timestamp + ".html";
            Path reportFile = reportPath.resolve(fileName);
            
            // Build HTML content
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n<head>\n");
            html.append("  <meta charset='UTF-8'>\n");
            html.append("  <title>Test Report - " + context.getName() + "</title>\n");
            html.append("  <style>\n");
            html.append("    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n");
            html.append("    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }\n");
            html.append("    .summary { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n");
            html.append("    .summary-item { display: inline-block; margin-right: 30px; }\n");
            html.append("    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n");
            html.append("    th { background: #667eea; color: white; padding: 15px; text-align: left; }\n");
            html.append("    td { padding: 12px 15px; border-bottom: 1px solid #ddd; }\n");
            html.append("    tr:hover { background: #f9f9f9; }\n");
            html.append("    .passed { color: #10b981; font-weight: bold; }\n");
            html.append("    .failed { color: #ef4444; font-weight: bold; }\n");
            html.append("    .skipped { color: #f59e0b; font-weight: bold; }\n");
            html.append("    .screenshot { max-width: 150px; cursor: pointer; border-radius: 5px; }\n");
            html.append("    .error { color: #ef4444; font-size: 12px; }\n");
            html.append("  </style>\n");
            html.append("</head>\n<body>\n");
            
            // Header
            html.append("  <div class='header'>\n");
            html.append("    <h1>🧪 Test Execution Report</h1>\n");
            html.append("    <p><strong>Test Suite:</strong> " + context.getName() + "</p>\n");
            html.append("    <p><strong>Generated:</strong> " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + "</p>\n");
            html.append("  </div>\n");
            
            // Summary
            int passed = (int) testResults.stream().filter(r -> r.status.equals("PASSED")).count();
            int failed = (int) testResults.stream().filter(r -> r.status.equals("FAILED")).count();
            int skipped = (int) testResults.stream().filter(r -> r.status.equals("SKIPPED")).count();
            int total = testResults.size();
            
            html.append("  <div class='summary'>\n");
            html.append("    <h2>📊 Summary</h2>\n");
            html.append("    <div class='summary-item'><strong>Total:</strong> " + total + "</div>\n");
            html.append("    <div class='summary-item'><strong class='passed'>Passed:</strong> " + passed + "</div>\n");
            html.append("    <div class='summary-item'><strong class='failed'>Failed:</strong> " + failed + "</div>\n");
            html.append("    <div class='summary-item'><strong class='skipped'>Skipped:</strong> " + skipped + "</div>\n");
            html.append("  </div>\n");
            
            // Test Results Table
            html.append("  <table>\n");
            html.append("    <tr><th>Test Name</th><th>Status</th><th>Duration (ms)</th><th>Screenshot</th><th>Error</th></tr>\n");
            
            for (TestResult result : testResults) {
                html.append("    <tr>\n");
                html.append("      <td>" + result.testName + "</td>\n");
                html.append("      <td class='" + result.status.toLowerCase() + "'>" + result.status + "</td>\n");
                html.append("      <td>" + result.duration + " ms</td>\n");
                
                if (result.screenshot != null) {
                    String screenshotPath = "../functional test screenshots/" + result.screenshot;
                    html.append("      <td><a href='" + screenshotPath + "' target='_blank'><img src='" + screenshotPath + "' class='screenshot' alt='Screenshot'/></a></td>\n");
                } else {
                    html.append("      <td>-</td>\n");
                }
                
                html.append("      <td class='error'>" + (result.error != null ? result.error : "-") + "</td>\n");
                html.append("    </tr>\n");
            }
            
            html.append("  </table>\n");
            html.append("</body>\n</html>");
            
            // Write to file
            try (FileWriter writer = new FileWriter(reportFile.toFile())) {
                writer.write(html.toString());
            }
            
            System.out.println("📄 HTML Report generated: " + reportFile.toAbsolutePath());
            
        } catch (IOException e) {
            System.err.println("❌ Failed to generate HTML report: " + e.getMessage());
        }
    }
    
    /**
     * Inner class to hold test result data
     */
    private static class TestResult {
        String testName;
        String status;
        long duration;
        String screenshot;
        String error;
        
        TestResult(String testName, String status, long duration, String screenshot, String error) {
            this.testName = testName;
            this.status = status;
            this.duration = duration;
            this.screenshot = screenshot;
            this.error = error;
        }
    }
}
