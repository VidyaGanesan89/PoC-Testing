package common;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

import environment.EnvironmentConfig;
import org.openqa.selenium.firefox.FirefoxDriverLogLevel;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import utility.CommonUtils;
import utility.Driver;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.NotImplementedException;
import org.openqa.selenium.*;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
//import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.safari.SafariDriver;
import org.openqa.selenium.safari.SafariOptions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;


public abstract class DriverBase {

    public enum BrowserType {
        CHROME,
        FIREFOX,
        IE,
        HTML_UNIT,
        ANDROID,
        ANDROID_WEB,
        IOS,
        IOS_WEB,
        CHROME_HEADLESS,
        CHROME_PROXY,
        FIREFOX_HEADLESS,
        EDGE,
        SAFARI,
        REMOTE_WEBDRIVER
    }

    public enum Context {
        DEFAULT,
        FRAME,
        MODAL_DIALOG,
    }

    // Constants
    private static final int DEFAULT_WAIT_SECONDS_SHORT = 5;
    private static final int DEFAULT_WAIT_SECONDS_STANDARD = 30;
    private static final int DEFAULT_WAIT_SECONDS_LONG = 120;
    private static final int EXPLICIT_WAIT_WARNING_THRESHOLD_SECONDS = 8;

    /**
     * The default instance of Selenium WebDriver.
     */
    public static WebDriver instance;

    private static Context activeContext = Context.DEFAULT;
    private static String activeContextFrameID = null;

    private static String baseAddress;

    private static int storedWaitSeconds = DEFAULT_WAIT_SECONDS_STANDARD;
    private static int currentWaitSeconds;


    /**
     * Gets the base address of the web application.
     *
     * @return The base address with trailing forward slash.
     */
    public static String getBaseAddress() {
        return baseAddress;
    }

    /**
     * Sets the base address of the web application.
     *
     * @param address The base address of the application.
     */
    public static void setBaseAddress(String address) {
        // Make sure address ends with forward slash
        if (address != null && !address.endsWith("/"))
            baseAddress = address + "/";
        else
            baseAddress = address;
    }

    /**
     * Initializes the driver to work with the indicated web browser.
     * This must be called before interacting with the web application.
     *
     * @param browserName The name of the browser to use (e.g. IE, CHROME, FIREFOX).
     */
    public static void initialize(String browserName) throws IOException {
        BrowserType browserType = BrowserType.valueOf(browserName);
        try {
            initialize(browserType);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Initializes the driver to work with the indicated web browser.
     * This must be called before interacting with the web application.
     *
     * @param browserType The type of browser to be used.
     */
    public static void initialize(BrowserType browserType) throws Exception {

        Reporter.logInfo("Initialize Driver", "Initializing driver with with browser '" + browserType + "'");

        // Configure the browser
        switch (browserType) {
            case IE:
                initializeIE();
                break;
            case FIREFOX:
                initializeFirefox();
                break;
            case CHROME:
                initializeChrome();
                break;
            case CHROME_HEADLESS:
                initializeChromeHeadless();
                break;
            case CHROME_PROXY:
                initializeProxyInjectedChrome();
                break;
            case HTML_UNIT:
                initializeHtmlUnitDriver();
                break;
            case EDGE:
                initializeEdgeDriver();
                break;
            case SAFARI:
                initializeSafariDriver();
                break;
            case REMOTE_WEBDRIVER:
                initializeRemoteWebDriver();
                break;
            default:
                throw new NotImplementedException("The browser '" + browserType + "' support has not been implemented.");
        }

        // Set the default wait settings
        turnOnWait();

    }

    private static void initializeRemoteWebDriver() throws MalformedURLException {
        // This supports running the test cases via a remote web driver session
        // pre-requisite:

        // Initialize remote web driver session
        String browser = System.getProperty("SELENIUM_BROWSER", "chrome");
        DesiredCapabilities dc = new DesiredCapabilities();
        // Enable browser logs
        LoggingPreferences logPrefs = new LoggingPreferences();
        logPrefs.enable(LogType.BROWSER, Level.INFO);

        dc.setBrowserName(browser);
        dc.setPlatform(Platform.LINUX);

        switch (browser) {
            case "chrome":
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--verbose", "--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage");
                dc.setCapability(ChromeOptions.CAPABILITY, options);
                dc.setCapability("goog:loggingPrefs", logPrefs);
                break;
            case "firefox":
                FirefoxOptions ffOptions = new FirefoxOptions();
                ffOptions.addArguments("-headless");
                dc.setCapability(ChromeOptions.CAPABILITY, ffOptions);
                ffOptions.setLogLevel(FirefoxDriverLogLevel.INFO);
                break;
        }
        String seleniumBaseUrl = System.getProperty("SELENIUM_BASE_URL", "http://localhost:4444");
        URL webDriverUrl = new URL(seleniumBaseUrl + "/wd/hub");
        instance = new RemoteWebDriver(webDriverUrl, dc);
        instance.manage().window().setSize(new Dimension(1024, 768));
    }

    private static void initializeSafariDriver() {
        //Pre-requisite: Configure Safari to Enable WebDriver Support
        // Prior to Safari automation, enable the Remote Automation feature from the developer menu. To do so, enable the Safari Developer menu first with the steps below:
        // 1. Go to Safari -> Preferences-> Advanced
        // 2. Tick mark the Checkbox with the label – Show Develop menu in menu bar
        // Once done, go to the Develop menu and click on the Allow Remote Automation option to enable it.
        // 3. Authorize safaridriver to launch the webdriverd service which hosts the local web server.
        // To permit this, run /usr/bin/safaridriver once manually and complete the authentication prompt.

        System.setProperty("webdriver.safari.driver", "path to the safari driver executable");
        // One can find the Safari Driver (v10 and above) at the following path – /usr/bin/safaridriver.
        // For Safari versions 10 and above, SafariDriver comes bundled by default with the browser that’s preinstalled in the macOS. No need to install the safari driver separately.

        SafariOptions options = new SafariOptions();
        instance = new SafariDriver(options);
        instance.manage().window().maximize();
    }


    private static void initializeEdgeDriver() {
        System.setProperty("webdriver.edge.driver", "src//test//resources//drivers//msedgedriver.exe");
        EdgeOptions options = new EdgeOptions();
        // added to fix 403 text error with Edge browser version 111 - can be removed later on
        options.addArguments("--remote-allow-origins=*");
        instance = new EdgeDriver(options);
        instance.manage().window().maximize();
    }

    /**
     * Initializes the WebDriver for use with the Chrome browser.
     */
    private static void initializeChrome() {
        String osName = System.getProperty("os.name").toLowerCase();
//        if (osName.startsWith("windows")) {
//            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver.exe");
//        } else if (osName.startsWith("mac")) {
//            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver");
//        }

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--incognito");
        options.addArguments("--disable-popup-blocking");
        options.addArguments("--disable-notifications");
        LoggingPreferences logPrefs = new LoggingPreferences();
        options.setCapability("goog:loggingPrefs", logPrefs);
        logPrefs.enable(LogType.BROWSER, Level.ALL);
        logPrefs.enable(LogType.DRIVER, Level.ALL);
        logPrefs.enable(LogType.PERFORMANCE, Level.INFO);
        
        
        // Add Chrome arguments for better logging
        options.addArguments("--enable-logging");
        options.addArguments("--log-level=0");
        options.addArguments("--v=1");
        
        instance = new ChromeDriver(options);
        instance.manage().window().maximize();
    }

    private static void initializeProxyInjectedChrome() throws Exception {
        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.startsWith("windows")) {
            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver.exe");
        } else if (osName.startsWith("mac")) {
            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver");
        }
        EnvironmentConfig config = CommonUtils.populateEnvConfig();
        String proxyServerUrl = config.common.proxyUrl;

        Proxy proxy = new Proxy();
        proxy.setHttpProxy(proxyServerUrl);
        proxy.setSslProxy(proxyServerUrl);

        ChromeOptions options = new ChromeOptions();
        options.setProxy(proxy);
        options.addArguments("--headless", "--silent");
        options.addArguments("--ignore-certificate-errors");
        //options.addArguments("--proxy-server=" + proxyServerUrl);
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--proxy-server=" + "--*.airupsers.com;*.fritz.co.za;*.fritz.com;*.internal.dns;*.pweh.com;*.ups.com;ups.com;*.upsat.com;*.upslog.com;*.upslogistics.com;*.ups-mi.net;*.ups-scs.com;*.utc.com;*iupsaircargo.ups-cargo-ams.com;10.*;153.2.*;156.134.*;172.*;180.130.*;192.*;205.*;206.13.32.*;upsrsa.co.za;*.upgf.com;*.upsfreight.com");
        options.addArguments("--window-size=1200,800");
        instance = new ChromeDriver(options);
    }

    /**
     * Initializes the WebDriver for use with the Chrome browser in headless mode.
     */
    private static void initializeChromeHeadless() {
        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.startsWith("windows")) {
            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver.exe");
        } else if (osName.startsWith("mac")) {
            System.setProperty("webdriver.chrome.driver", "src//test//resources//drivers//chromedriver");
        }
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--headless", "--silent");
        options.addArguments("--window-size=1200,800");
        instance = new ChromeDriver(options);
    }

    /**
     * Initializes the WebDriver for use with the HtmlUnitDriver
     */
    private static void initializeHtmlUnitDriver() {
//        Html Unit browser dependacy is marked as vulnerable in FROG and no projects are using Html Unit,hence commenting this out.
//        HtmlUnitDriver htmlUnitdriver = new HtmlUnitDriver(true);
//        instance = htmlUnitdriver;
        //throw new NotImplementedException("HtmlUnitDriver has not been implemented."); // TODO: Implement HtmlUnitDriver
    }

    /**
     * Initializes the WebDriver for use with the IE browser.
     */
    private static void initializeIE() {
        System.setProperty("webdriver.ie.driver", "src//test//resources//drivers//MicrosoftWebDriver.exe");
        instance = new InternetExplorerDriver();
        instance.manage().window().maximize();
    }

    /**
     * Initializes the WebDriver for use with the Firefox browser.
     */
    private static void initializeFirefox() {
        System.setProperty("webdriver.gecko.driver", "src//test//resources//drivers//geckodriver.exe");
        instance = new FirefoxDriver();
        instance.manage().window().maximize();
    }

    /**
     * Closes the browser and finalizes the driver.
     */
    public static void close() {
        if (instance != null) {
            try {
                instance.close();
                instance.quit();
            } catch (SessionNotCreatedException e) {
                // Session was already closed.  Ignore.
            }
        }
    }

    /**
     * Turns on implicit wait for object elements using a short wait time.
     */
    public static void turnOnWait() {
        setWait(DEFAULT_WAIT_SECONDS_STANDARD);
    }

    /**
     * Turns on implicit wait for object elements using a short wait time.
     */
    public static void turnOnShortWait() {
        setWait(DEFAULT_WAIT_SECONDS_SHORT);
    }

    /**
     * Turns on implicit wait for object elements using a long wait time.
     */
    public static void turnOnLongWait() {
        setWait(DEFAULT_WAIT_SECONDS_LONG);
    }

    /**
     * Turns off implicit wait for object elements.
     */
    public static void turnOffWait() {
        setWait(0);
    }

    /**
     * Stores the current implicit wait to be restored at a later time.
     * <p>
     * //@see restorePreviousWait
     */
    public static void storeCurrentWait() {
        // TODO Convert this to a stack so that multiples calls can be stacked on each other
        storedWaitSeconds = currentWaitSeconds;
    }

    /**
     * Restores the previously stored implicit wait.
     *
     * @see
     */
    public static void restorePreviousWait() {
        setWait(storedWaitSeconds);
    }

    /**
     * Sets the implicit wait time for object elements.
     *
     * @param seconds The number of seconds to set for the implicit wait.
     */
    private static void setWait(int seconds) {
        currentWaitSeconds = seconds;
        instance.manage().timeouts().implicitlyWait(Duration.ofSeconds(seconds));
    }

    /**
     * Waits the specified number of seconds.
     *
     * @param seconds The number of seconds to wait.
     */
    public static void wait(int seconds) {
        wait((double) seconds);
    }

    /**
     * Waits the specified number of seconds.
     *
     * @param seconds The number of seconds to wait.
     */
    public static void wait(double seconds) {

        // Check for long wait times
        if (seconds > EXPLICIT_WAIT_WARNING_THRESHOLD_SECONDS) {
            // TODO Log a warning message to discourage the use of static waits in favor of better object synchronization
            Reporter.logWarning("Avoid Explicit Waits", "Explicit waits can unnecessarily slow down test execution.  Avoid long wait times in favor of object synchronization.");
        }

        try {
            System.out.println(String.format("Waiting %.2f seconds", seconds));
            Thread.sleep((int) (seconds * 1000));
        } catch (InterruptedException e) {
            // Ignore exception
        }
    }

    /**
     * Waits for the specified test to return true.
     *
     * @param test The test to perform.
     */
    public static void waitFor(Callable<Boolean> test) {
        Timer timer = new Timer(currentWaitSeconds);
        do {

            try {
                // Call the test and exit if successful
                Boolean result = test.call();
                if (result == true)
                    return;

            } catch (Exception e) {
                // Ignore exceptions
            }
            // Wait and try again
            wait(0.5);

        } while (!timer.isTimedOut());
        throw new TimeoutException("Timeout after " + timer.getTimeoutSeconds() + " seconds waiting for condition to be met.");
    }

    /**
     * Waits for the specified element to be visible and clickable based on the
     * current timeout.
     *
     * @param locator The locator for the element whose availability will be tested.
     */



    /**
     * Waits for the specified element to be visible and clickable based on the
     * current timeout.
     *
     * @param element The element whose availability will be tested.
     */
    public static void waitForElement(WebElement element) {
        //WebDriverWait wait = new WebDriverWait(instance, currentWaitSeconds);
//        Wait<WebDriver> wait = new WebDriverWait(instance, Duration.ofSeconds(20));
//        ensureElementVisible(element);
        new WebDriverWait(instance, Duration.ofSeconds(20)).until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return element.isDisplayed() && element.isEnabled();
            }
        });
    }

    public static void waitForElement(By locator) {
        //WebDriverWait wait = new WebDriverWait(instance, currentWaitSeconds);
//        Wait<WebDriver> wait = new WebDriverWait(instance, Duration.ofSeconds(20));
//        ensureElementVisible(element);
        new WebDriverWait(instance, Duration.ofSeconds(20)).until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return driver.findElement(locator).isDisplayed() && driver.findElement(locator).isEnabled();
            }
        });
    }

    public static void waitForElementToBeVisible(By locator) {
        //WebDriverWait wait = new WebDriverWait(instance, currentWaitSeconds);
//        Wait<WebDriver> wait = new WebDriverWait(instance, Duration.ofSeconds(20));
//        ensureElementVisible(element);
    	Driver.wait(2);
        new WebDriverWait(instance, Duration.ofSeconds(45)).until(ExpectedConditions.visibilityOfElementLocated(locator));
    }
        public static void waitForElementToBeVisible(WebElement element) {
            //WebDriverWait wait = new WebDriverWait(instance, currentWaitSeconds);
//        Wait<WebDriver> wait = new WebDriverWait(instance, Duration.ofSeconds(20));
//        ensureElementVisible(element);
            new WebDriverWait(instance, Duration.ofSeconds(30)).until(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver driver) {
                    return element.isDisplayed() ;
                }
            });
        //Function<WebDriver, Boolean> function = new Function<instance, Boolean>() {
        //	return ExpectedConditions.elementToBeClickable(element);
    }
    public static void waitForElementToBePresent(By locator) {
        new WebDriverWait(instance, Duration.ofSeconds(20)).until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    public static void waitForElementToBeEnabled(By locator) {
        new WebDriverWait(instance, Duration.ofSeconds(20)).until(ExpectedConditions.elementToBeClickable(locator));
    }


    public static void waitForElementToBeEnabled(WebElement element) {
        new WebDriverWait(instance, Duration.ofSeconds(20)).until(ExpectedConditions.elementToBeClickable(element));
    }

    public static void waitUntilPageTitleMatchingWith(String title){
        new WebDriverWait(instance, Duration.ofSeconds(30)).until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return Objects.requireNonNull(driver.getTitle()).contains(title);
            }
        });
    }
    /**
     * Waits for the specified element to become stale (i.e. reference is no longer valid).
     *
     * @param element The element.
     */
    public static void waitForElementToBecomeStale(WebElement element) {
        System.out.println("Waiting for element to become stale...");
        Timer timer = new Timer(currentWaitSeconds);
        try {

            do {

                // Attempt to access the element
                element.getText();

                // No exception thrown, so the element is still available
                wait(0.5);
                System.out.println("\tElement is still available.  Trying again...");

            } while (!timer.isTimedOut());

            // Timeout
            Reporter.logWarning("Timeout on Element", "Timeout waiting for element to become stale.  Playback may be impacted.");
            System.out.println("\tElement is still available after timeout of " + timer.getElapsedSeconds() + " seconds.  Continuing.");

        } catch (StaleElementReferenceException e) {
            // This is what we wanted to happen.
            System.out.println("\tElement is stale after " + timer.getElapsedSeconds() + " seconds.");
            return;
        }
    }

    /**
     * Finds the first element matching any of the provided locators.
     *
     * @param allLocators The locators used to identify elements.
     * @return Returns the first element that matches any locator.
     */
    public static WebElement findAnyElement(By... allLocators) {
        return findAnyElement(null, allLocators);
    }

    /**
     * Finds the first element matching any of the provided locators.
     *
     * @param rootElement The root element from which elements will be searched.  When null, the WebDriver root will be used.
     * @param allLocators The locators used to identify elements.
     * @return Returns the first element that matches any locator.
     */
    public static WebElement findAnyElement(WebElement rootElement, By... allLocators) {
        Timer timer = new Timer(currentWaitSeconds);
        try {

            // Disable explicit wait so that 'findElement' returns immediately
            storeCurrentWait();
            turnOffWait();

            do {

                // Iterate looking for the first element that matches a locator
                for (By locator : allLocators) {
                    try {

                        // Attempt to find this element
                        WebElement element;
                        if (rootElement == null)
                            element = instance.findElement(locator);
                        else
                            element = rootElement.findElement(locator);

                        // Return the located element if successful
                        if (element != null)
                            return element;

                    } catch (Exception e) {
                        // Ignore exceptions
                    }
                }

                // Wait and try again
                wait(0.5);

            } while (!timer.isTimedOut());

            // Element not found
            throw new TimeoutException("Timeout after " + timer.getTimeoutSeconds() + " seconds looking for elements.");

        } finally {

            // Restore explicit wait
            restorePreviousWait();

        }
    }

    /**
     * Waits for the specified element to no longer be visible based on the
     * current timeout.
     *
     * @param locator The locator for identifying the element.
     */
    public static void waitWhileElementVisible(By locator) {
        System.out.println("Waiting for element '" + locator.toString() + "' to not be visible...");

        // BWP 10/19/16: The Selenium 'wait.until' option to check for
        // invisibility of an element was not consistently returning
        // when some elements were not longer visible. Replacing the Selenium
        // built-in functionality with a timed
        // loop that repeated checks for the element to be available and quits
        // when it is no longer found.
        //
        // -- Selenium Code Replaced --
        // WebDriverWait wait = new WebDriverWait(instance, currentWaitSeconds);
        // wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
        // ------------------------- --

        int originalTimeout = currentWaitSeconds;
        Timer timer = new Timer(originalTimeout);
        try {
            turnOffWait();
            while (instance.findElement(locator) != null) {

                // Check for operation timeout
                if (timer.isTimedOut())
                    throw new TimeoutException(
                            "Timeout waiting for element '" + locator.toString() + "' to no longer be visible.");

                // Wait and try again
                wait(0.5);
            }
        } catch (NoSuchElementException e) {
            System.out.println("\tElement is no longer visible.");
        } finally {
            setWait(originalTimeout);
        }

    }

    /**
     * Waits for the specified URL (or partial URL) to be loaded in the browser
     * based on the current timeout.
     *
     * @param url The full or partial URL to wait on
     */
    public static void waitForUrl(String url) {
        System.out.println("Waiting up to " + currentWaitSeconds + " seconds for URL <<" + url + ">> ...");
        Timer timer = new Timer(currentWaitSeconds);
        String currentUrl;
        while (!(currentUrl = instance.getCurrentUrl()).contains(url)) {

            // Quick if we have timed out waiting
            if (timer.isTimedOut()) {
                String message = "Timeout waiting for URL <<" + url + ">>; current URL <<" + currentUrl + ">>; Timeout = " + timer.getTimeoutSeconds() + "s";
                System.out.println(message);
                throw new TimeoutException(message);
            }

            // Wait before trying again
            System.out.println("\tNot found, trying again...");
            wait(0.5);
        }
        System.out.println("\tURL <<" + url + ">> found after " + timer.getElapsedSeconds() + " seconds as <<" + currentUrl + ">>");
    }

    /**
     * Ensures the element is visible
     *
     * @param element The element to be made visible
     */
    public static void ensureElementVisible(WebElement element) {
        ((JavascriptExecutor) instance).executeScript("arguments[0].scrollIntoView(false);", element);
    }

    /**
     * To get the current time stamp of the system
     *
     * @return The time stamp in the format 'yyyy_MM_dd_hh_mm_ss_a'.
     */
    public static String getCurrentTimeStamp() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy_MM_dd_hh_mm_ss_a");
        String timeStamp = dateFormat.format(new Date());
        return timeStamp;
    }

    /**
     * Captures a screenshot of the current browser screen to a temporary file.
     *
     * @return Returns the File representing the captured screenshot if taken; otherwise null if the browser does not support taking screenshots.
     */
    public static File captureScreenshot() throws IOException {
        String fileName = null;
        return captureScreenshot(fileName);
    }

    /**
     * Captures a screenshot of the current browser screen.
     *
     * @param fileName The full path where the captured image will be stored.  When null, a temporary file will be used.
     * @return Returns the File representing the captured screenshot if taken; otherwise null if the browser does not support taking screenshots.
     */
    public static File captureScreenshot(String fileName) throws IOException {

        // Ignore screenshot if the driver does not support taking screenshots (i.e. HtmlUnitDriver)
        if (!(Driver.instance instanceof TakesScreenshot)) {
            System.out.println("Ignoring screenshot request from unsupported WebDriver.");
            return null;
        }

        try {
            // Capture the file from the driver and places in the temporary Folder.
            File sourceFile = ((TakesScreenshot) Driver.instance).getScreenshotAs(OutputType.FILE);

            if (fileName == null || fileName.isEmpty()) {
                // Return the temporary file
                return sourceFile;
            } else {
                // Copy to the desired destination location
                File destinationFile = new File(fileName);
                FileUtils.copyFile(sourceFile, destinationFile);

                // Return the copied file
                return destinationFile;
            }

        } catch (IOException e) {
            System.out.println("Exception while taking screenshot; " + e.getMessage());
            throw (e);
        }
    }

    // ********************************************************************************
    //	Context Management
    // ********************************************************************************

    /**
     * Deletes all cookies for the current domain.
     */
    public static void deleteAllCookiesForCurrentDomain() {
        instance.manage().deleteAllCookies();
    }

    /**
     * Gets the currently configured context.
     *
     * @return
     */
    public static Context getActiveContext() {
        return activeContext;
    }

    /**
     * Switches the driver context to the default content.
     */
    public static void switchToDefaultContent() {
        switchToDefaultContent(false);
    }

    /**
     * Switches the driver context to the default content.
     *
     * @param forceSwitch Forces a context switch even if the driver thinks the context is already set.
     */
    public static void switchToDefaultContent(boolean forceSwitch) {
        if (forceSwitch || activeContext != Context.DEFAULT) {
            System.out.println("Switching driver context to default.");
            instance.switchTo().defaultContent();
            activeContext = Context.DEFAULT;
        }
    }

    /**
     * Switches the driver context to the specified frame.
     *
     * @param frame The ID of the frame.
     */
    public static void switchToFrame(String frame) {
        switchToFrame(frame, false);
    }

    /**
     * Switches the driver context to the specified frame.
     *
     * @param frame       The ID of the frame.
     * @param forceSwitch Forces a context switch even if the driver thinks the context is already set.
     */
    public static void switchToFrame(String frame, boolean forceSwitch) {
        if (forceSwitch || activeContext != Context.MODAL_DIALOG || !frame.equals(activeContextFrameID)) {
            System.out.println("Switching driver context to frame '" + frame + "'.");
            instance.switchTo().frame(frame);
            activeContext = Context.FRAME;
            activeContextFrameID = frame;
        }
    }

    /**
     * Switches the driver context to the active element of a modal dialog.
     */
    public static void switchToModalDialog() {
        switchToModalDialog(false);
    }

    /**
     * Switches the driver context to the active element of a modal dialog.
     *
     * @param forceSwitch Forces a context switch even if the driver thinks the context is already set.
     */
    public static void switchToModalDialog(boolean forceSwitch) {
        if (forceSwitch || activeContext != Context.MODAL_DIALOG) {
            System.out.println("Switching driver context to modal dialog.");
            instance.switchTo().activeElement();
            activeContext = Context.MODAL_DIALOG;
        }
    }

    /**
     * Switches the driver context to the specified window.
     *
     * @param windowTitle The title of new to which switching is needed.
     */
    public static void switchToWindow(String windowTitle) {
        switchToWindow(windowTitle, false);
    }

    /**
     * Switches the driver context to newly opened window.
     */
    public static void switchToWindow() {
        switchToWindow(false);
    }

    /**
     * Switches the driver context to the newly opened window.
     *
     * @param forceSwitch Forces a context switch even if the driver thinks the context is already set.
     */
    public static void switchToWindow(boolean forceSwitch) {
        if (forceSwitch || activeContext != Context.MODAL_DIALOG) {
            System.out.println("Switching to driver context window");
            // Switch to new window opened
            for (String windowHandle : instance.getWindowHandles()) {
                instance.switchTo().window(windowHandle);
            }
        }
    }

    /**
     * Switches the driver context to the newly opened window.
     *
     * @param windowTitle Title of the window to which switch is needed.
     * @param forceSwitch Forces a context switch even if the driver thinks the context is already set.
     */
    public static void switchToWindow(String windowTitle, boolean forceSwitch) {
        try {
            boolean desiredWindowFound = false;
            if (forceSwitch || activeContext != Context.MODAL_DIALOG) {
                System.out.println("Switching to driver context window having window title " + windowTitle);
                WebDriver window = null;
                Iterator<String> windowIterator = instance.getWindowHandles().iterator();
                while (windowIterator.hasNext()) {
                    String windowHandle = windowIterator.next();
                    window = instance.switchTo().window(windowHandle);
                    String title = window.getTitle();
                    if (title.contains(windowTitle)) {
                        desiredWindowFound = true;
                        break;
                    }
                }
            }
            if (!desiredWindowFound)
                throw new NoSuchElementException(
                        "Window with title " + windowTitle + " does not exist");
        } catch (NoSuchElementException e) {
            System.out.println("Window with title " + windowTitle + " does not exist");
        }
    }

    /**
     * Gets the title of the window
     *
     * @return Text of window title
     */
    public static String getTitle() {
        return instance.getTitle().trim();
    }

}
