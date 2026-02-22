package common;


import com.aventstack.extentreports.*;
import com.aventstack.extentreports.gherkin.model.*;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import utility.Constants;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


public class Reporter {


	static ExtentReports extent = new ExtentReports();
	static ExtentSparkReporter sparkReporter;
	private static ExtentTest suite = null;
	private static ExtentTest logger;
	private static ExtentTest clazz;
	private static ExtentTest feature = null;
	private static ExtentTest scenario;
	private static String runReportDirectoryName;
	static {

		Date date = Calendar. getInstance(). getTime();
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd_hh_mm_ss");
		String strDate = dateFormat. format(date);
		// Creating the unique run directory for each execution.
		File runReportDirectory = new File(Constants.REPORTS_PATH + "Run_" + strDate);

		if (System.getProperty("REPORTS_PATH") != null && !System.getProperty("REPORTS_PATH").isBlank()) {
			runReportDirectory = new File(System.getProperty("REPORTS_PATH"));
		}

		runReportDirectoryName = runReportDirectory.getAbsolutePath();
		sparkReporter = new ExtentSparkReporter(runReportDirectory + "//report.html");
		extent.attachReporter(sparkReporter);
		File configFile = new File(new File(Constants.PROJECT_PATH), "extent-config.xml");
		try {
			sparkReporter.loadXMLConfig(configFile);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
		sparkReporter.config().setCss(".accordion>.card>.card-header>.card-title>a {padding: 18px 25px; display: block; color: #f8f9fa;}");
		logger = extent.createTest("logger");
	}
	public static void logFail(String message, WebDriver driver) {
		String screenshotPath = captureScreenshot(driver);
		extent.createTest("").fail(message, MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
	}

	private static String captureScreenshot(WebDriver driver) {
		String screenshotPath = "";
		try {
			File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
			String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
			screenshotPath = "screenshots/screenshot_" + timestamp + ".png";

			if (System.getProperty("REPORTS_PATH") != null && !System.getProperty("REPORTS_PATH").isBlank()) {
				screenshotPath = new File(System.getProperty("REPORTS_PATH")) + "/" + screenshotPath;
			}

			FileUtils.copyFile(src, new File(screenshotPath));
		} catch (IOException e) {
			e.printStackTrace();
		}
		return screenshotPath;
	}

	/**
	 * Gets the full path of the directory where report information is stored
	 */
	public static String getReportDirectory() {
		return runReportDirectoryName;
	}

	/**
	 * Checks if the file exists relative to the report directory.
	 * @param	relativeFilePath	The path to the file, relative to the current run directory.
	 * @return 	Returns true if the file exists in the relative file path; otherwise false.
	 */
	public static boolean doesFileExistInReportDirectory(String relativeFilePath) {
		File file = new File(getReportDirectory() + "//" + relativeFilePath);
		return file.exists();
	}

	/**
	 * Marks the beginning of a group of tests that will be collected under a single group.
	 * @param groupName	Name of the test group.
	 */
	public static void startTestGroup(String groupName) {
		extent.setAnalysisStrategy(AnalysisStrategy.SUITE);
		suite = extent.createTest(groupName).createNode(groupName);
		logger = suite;
		extent.removeTest("logger");
	}

	/**
	 * Marks the end of a group of tests.
	 */
	public static void endTestGroup() {

		if (suite != null) {
			extent.flush();
//            suite = null;
			logger = null;
			feature = null;
		}

	}

	/**
	 * Marks the beginning of a test case.
	 * @param  testName		Name of the test
	 */
	public static void startTest(String testName) {
		// Start the test without categories
		startTest(testName, new String[0]);
	}

	/**
	 * Marks the beginning of a test case.
	 * @param  testName		Name of the test
	 * @param  category		Optional categories to associate with the test
	 */
	public static void startTest(String testName, String...category ) {
		if (suite != null) {
			clazz = suite.createNode(testName);
			logger = clazz;
		} else if (feature != null) {
			scenario = feature.createNode(Scenario.class, testName);
			logger = scenario;
		}
		// User can assign a single test to multiple categories for reporting purpose
		// Gets the list of categories and assigns them to test

		for (String categoryToAssign : category) {
			if (categoryToAssign != null && !categoryToAssign.isEmpty())
				logger.assignCategory(categoryToAssign);

		}

		logger.log(Status.INFO, "Starting test '" + testName + "'");
	}

	/**
	 * Marks the end of a test.
	 */
	public static void endTest() {
		if (suite != null) {
			clazz = null;
			logger = suite;
		} else if (feature != null) {
			clazz = null;
			logger = feature;
		}
		extent.flush();
	}

	/**
	 * Initializes a complete test suite.
	 */
	public static void startSuite() {
		// Nothing at this time
	}

	/**
	 * Finalizes a complete test suite.
	 */
	public static void endSuite() {
		// Make sure the report is closed
//		if (report != null)
//			report.removeTest(parentLogger);
	}

	/**
	 * Logs an informational message to the report.
	 *
	 * @param	message		The message to log.
	 */
	public static void logInfo(String message) {
		String stepName = null;
		logInfo(stepName, message);
	}

	/**
	 * Logs an informational message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Information' will be used.
	 * @param	message		The message to log.
	 */
	public static void logInfo(String stepName, String message) {
		boolean takeScreenshot = false;
		logInfo(stepName, message, takeScreenshot);
	}

	/**
	 * Logs an informational message to the report.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Information' will be used.
	 * @param	message			The message to log.
	 * @param 	takeScreenshot 	Pass true to take screenshot to include in the report; otherwise false if a screenshot is not needed.
	 */
	public static void logInfo(String stepName, String message, boolean takeScreenshot) {
		if (stepName == null || stepName.isEmpty())
			stepName = "Information";
		System.out.println(String.format("[INFO] %s - %s", stepName, message));
		logger.log(Status.INFO, message);

		// Include an additional step with the screenshot (if requested)
		if (takeScreenshot) {
			logScreenshot(Status.PASS, stepName, message);
		}

	}

	/**
	 * Logs Pass test message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Pass' will be used.
	 * @param	message		The message to log.
	 */
	public static void logPass(String stepName, String message) {
		boolean takeScreenshot = false;
		logPass(stepName, message, takeScreenshot);
	}

	/**
	 * Logs Pass test message to the report.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Pass' will be used.
	 * @param	message			The message to log.
	 * @param 	takeScreenshot 	Pass true to take screenshot to include in the report; otherwise false if a screenshot is not needed.
	 */
	public static void logPass(String stepName, String message, boolean takeScreenshot) {
		if (suite != null) {
			if (logger == null) {
				logger = extent.createTest(stepName);
			}
			if (stepName == null || stepName.isEmpty())
				stepName = "Pass";
			System.out.printf("[PASS] %s - %s%n", stepName, message);
			logger.log(Status.PASS, message);
		} else if (feature != null) {
			String stepType = Scenario.class.getTypeName();
			if (stepType.equals(Given.getGherkinName())) {
				logger.createNode(Given.class, stepName).log(Status.PASS,stepName);
			} else if (stepType.equals(And.getGherkinName())) {
				logger.createNode(And.class, stepName).log(Status.PASS,stepName);
			} else if (stepType.equals(When.getGherkinName())) {
				logger.createNode(When.class, stepName).log(Status.PASS,stepName);
			} else if (stepType.equals(Then.getGherkinName())) {
				logger.createNode(When.class, stepName).log(Status.PASS,stepName);
			}
		}

		// Include an additional step with the screenshot (if requested)
		if (takeScreenshot) {
			logScreenshot(Status.PASS, stepName, message);
		}

	}

	/**
	 * Logs Skip test message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Skip Information' will be used.
	 * @param	message		The message to log.
	 */
	public static void logSkip(String stepName,String message) {
		if (stepName == null || stepName.isEmpty())
			stepName = "Skip Information";
		System.out.println(String.format("[SKIP] %s - %s", stepName, message));
		logger.log(Status.SKIP, message);
	}

	/**
	 * Logs Pass test message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Pass' will be used.
	 * @param	message		The message to log.
	 */
	public static void logWarning(String stepName, String message) {
		logPass(stepName, message, false);
	}

	/**
	 * Logs Warning test message to the report.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Warning' will be used.
	 * @param	message			The message to log.
	 * @param 	takeScreenshot 	Pass true to take screenshot to include in the report; otherwise false if a screenshot is not needed.
	 */
	public static void logWarning(String stepName, String message, boolean takeScreenshot) {
		if (stepName == null || stepName.isEmpty())
			stepName = "Warning";
		System.out.println(String.format("[WARNING] %s - %s", stepName, message));
		logger.log(Status.WARNING, message);

		// Include an additional step with the screenshot (if requested)
		if (takeScreenshot) {
			logScreenshot(Status.WARNING, stepName, message);
		}

	}

	/**
	 * Logs test Error message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Error Information' will be used.
	 * @param	message		The message to log.
	 */
	public static void logError(String stepName, String message) {
		logError(stepName, message, null);
	}

	/**
	 * Logs test Error message to the report.
	 *
	 * @param	stepName	The brief name of the step; if null or empty, the name 'Error Information' will be used.
	 * @param	message		The message to log.
	 * @param 	t			Exception message to the log
	 */
	public static void logError(String stepName, String message, Throwable t) {
		if (stepName == null || stepName.isEmpty())
			stepName = "Error Information";
		System.err.println(String.format("[ERROR] %s - %s", stepName, message));
		logger.log(Status.FAIL, message);

		// Include an additional step with the throwable (if provided)
		if(t != null) {
			logger.log(Status.FAIL,  t);
		}

	}

	/**
	 * Logs test Fail message to the report with a screenshot.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Failure Information' will be used.
	 * @param	message			Brief description about the failure
	 */
	public static void logFail(String stepName, String message) {
		logFail(stepName, message, true);
	}

	/**
	 * Logs test Fail message to the report.
	 * When a custom check fails, user can call this method to log the failure with or without screenshot including failure description.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Failure Information' will be used.
	 * @param	message			Brief description about the failure
	 * @param 	takeScreenshot 	Pass true to take screenshot to include in the report; otherwise false if a screenshot is not needed.
	 */
	public static void logFail(String stepName, String message, boolean takeScreenshot) {
		logFail(stepName, message, takeScreenshot, null);
	}

	/**
	 * Logs test Fail message to the report.
	 * When an assertion fails, it triggers the Failure of the test and this method will be called after.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Failure Information' will be used.
	 * @param	message			Brief description about the failure
	 * @param 	t				Exception message to the log
	 */
	public static void logFail(String stepName, String message, Throwable t) {
		logFail(stepName, message, true, t);
	}

	/**
	 * Logs test Fail message to the report.
	 * When an assertion fails, it triggers the Failure of the test and this method will be called after.
	 *
	 * @param	stepName		The brief name of the step; if null or empty, the name 'Failure Information' will be used.
	 * @param	message			Brief description about the failure
	 * @param 	takeScreenshot 	Pass true to take screenshot to include in the report; otherwise false if a screenshot is not needed.
	 * @param 	t				Exception message to the log
	 */
	public static void logFail(String stepName, String message, boolean takeScreenshot, Throwable t) {
		if (stepName == null || stepName.isEmpty())
			stepName = "Failure Information";

		System.err.println(String.format("[FAIL] %s - %s", stepName, message));

		logger.log(Status.FAIL, message);

		// Include an additional step with the screenshot (if requested)
		if (takeScreenshot) {
			message = "errorScreenshot";
			logScreenshot(Status.FAIL, stepName, message);
		}

		// Include an additional step with the throwable (if provided)
		if(t != null) {
			logger.log(Status.FAIL,  t);
		}
	}

	/**
	 * Logs a screenshot to the report.
	 * @param status            The status of the message being logged.
	 * @param stepName            The name of the step.
	 * @param screenshotName    The name to use when describing the screenshot.
	 */
	private static void logScreenshot(Status status, String stepName, String screenshotName) {
		try {
			String screenshotPath = saveScreenshotToResultsFolder(screenshotName);
			if (screenshotPath != null) {
				ExtentTest screenshotTest = logger.createNode("Screenshot: " + screenshotName);
				screenshotTest.log(status, "Screenshot Path: " + screenshotPath, MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
			} else {
				logger.log(status, stepName);
			}
		} catch (IOException e) {
			logError("Capture Screenshot [" + stepName + "]", "Error capturing screenshot. Error message = " + e.getMessage());
		}
	}


	/**
	 * Captures the Screenshot of the current browser screen and saves the image in the current run results folder.
	 * @param	screenshotName	Name of the screenshot to be taken
	 * @return 					Returns the path of the captured screenshot if taken; otherwise null if not taken
	 */
	private static String saveScreenshotToResultsFolder(String screenshotName) throws IOException {

		// Combine the requested name with the current timestamp to make the file name unique
		String uniqueFileName = screenshotName + "_" + DriverBase.getCurrentTimeStamp() + ".png";

		// TODO Need to make sure that the generated file name only includes valid file system characters

		// Store the screenshot in current execution run folder
		File capturedFile = DriverBase.captureScreenshot(runReportDirectoryName + "/" + uniqueFileName);
		if (capturedFile == null) {
			// The current browser does not support screen capture.  No need to log anything.
			return null;
		}

		// Return the full path of the captured file
		return capturedFile.getAbsolutePath();
	}

}