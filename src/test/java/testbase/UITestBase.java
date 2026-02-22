package testbase;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import utility.Driver;
import utility.PropertyReader;

/**
 * UITestBase class provides setup and teardown methods for all UI tests.
 * Uses TestNG annotations for test lifecycle management.
 */
public class UITestBase {

    /**
     * Setup method executed before each test method.
     * Initializes WebDriver and navigates to base URL.
     */
    @BeforeMethod
    public void setUp() {
        try {
            System.out.println("========================================");
            System.out.println("Starting Test Setup");
            System.out.println("========================================");
            
            // Initialize WebDriver
            Driver.initializeDriver();
            System.out.println("WebDriver initialized successfully");
            
            // Navigate to base URL from properties
            // Default is about:blank so tests that manage their own navigation
            // are not forced to load parcelpro3 before their target URL.
            String baseUrl = PropertyReader.getProperty("base.url", "about:blank");
            if (baseUrl != null && !baseUrl.isEmpty() && !baseUrl.equalsIgnoreCase("about:blank")) {
                Driver.navigateTo(baseUrl);
                System.out.println("Navigated to: " + baseUrl);
            } else {
                System.out.println("Base URL not set — skipping initial navigation (test will navigate itself)");
            }
            
            System.out.println("Setup completed successfully");
            System.out.println("========================================");
            
        } catch (Exception e) {
            System.err.println("Error during test setup: " + e.getMessage());
            throw new RuntimeException("Test setup failed", e);
        }
    }

    /**
     * Teardown method executed after each test method.
     * Quits the WebDriver instance.
     */
    @AfterMethod
    public void tearDown() {
        try {
            System.out.println("========================================");
            System.out.println("Starting Test Teardown");
            System.out.println("========================================");
            
            // Quit WebDriver
            Driver.quitDriver();
            System.out.println("WebDriver quit successfully");
            
            System.out.println("Teardown completed successfully");
            System.out.println("========================================");
            
        } catch (Exception e) {
            System.err.println("Error during test teardown: " + e.getMessage());
        }
    }
}
