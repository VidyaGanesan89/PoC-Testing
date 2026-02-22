package common;

import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Defines assertion tests that can be performed to validate that conditions are passing or failing expectations.
 * 
 */
public class Assert {
	
	/**
	 * Asserts that a failed condition was experienced.
	 * @param message	The message to display with the failure.
	 */
	public static void fail(String message) {
		org.testng.Assert.fail(message);
	}		
	
    /**
     * Asserts that given condition is true.
     * If not an assertionError will be thrown
     * @param condition condition to validate
     */
    public static void isTrue(boolean condition) {
        isTrue(condition, null, null);
    }

    /**
     * Asserts that given condition is true.
     * If not an assertionError will be thrown
     * @param condition 	condition to validate
     * @param message  		The message to display in both pass and fail log messages.
     */
    public static void isTrue(boolean condition, String message) {
        isTrue(condition, message, message);
    }
	
    /**
     * Asserts that given condition is true.
     * If not an assertionError will be thrown with the given message
     * will be thrown.
     * @param condition     condition to validate
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isTrue(boolean condition, String passMessage, String failMessage) {
        String stepName = "Assert True";
        if (failMessage == null)
            org.testng.Assert.assertTrue(condition);        	
        else
            org.testng.Assert.assertTrue(condition, failMessage);
        if (passMessage == null)        	
            Reporter.logPass(stepName, "The condition is True as expected.");
        else
        	Reporter.logPass(stepName, passMessage);
    }

    /**
     * Asserts that given condition is false.
     * If not an assertionError will be thrown
     * @param condition condition to validate
     */
    public static void isFalse(boolean condition) {
        isFalse(condition, null, null);
    }

    /**
     * Asserts that given condition is false.
     * If not an assertionError will be thrown
     * @param condition 	condition to validate
     * @param message  		The message to display in both pass and fail log messages.
     */
    public static void isFalse(boolean condition, String message) {
        isFalse(condition, message, message);
    }
    
    /**
     * Asserts that given condition is false.
     * If not an assertionError will be thrown with the given message
     * @param condition     condition to validate
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isFalse(boolean condition, String passMessage, String failMessage) {
        String stepName = "Assert False";
        if (failMessage == null)
            org.testng.Assert.assertFalse(condition);
        else
            org.testng.Assert.assertFalse(condition, failMessage);
        if (passMessage == null)
        	Reporter.logPass(stepName, "The condition is False as expected.");
        else
        	Reporter.logPass(stepName, passMessage);
    }

    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThan(Number value, Number compareTo) {
    	isGreaterThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThan(String value, String compareTo) {
    	isGreaterThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThan(Date value, Date compareTo) {
    	isGreaterThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThan(Number value, Number compareTo, String message) {
    	isGreaterThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThan(String value, String compareTo, String message) {
    	isGreaterThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThan(Date value, Date compareTo, String message) {
    	isGreaterThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThan(Number value, Number compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        if (value.doubleValue() > compareTo.doubleValue()) {
            Reporter.logPass("Assert Greater Than", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than", failMessage);
            throw new AssertionError(failMessage);
        }
        
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThan(String value, String compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) > 0) {
            Reporter.logPass("Assert Greater Than", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than", failMessage);
            throw new AssertionError(failMessage);
        }
    }
    
    /**
     * Asserts that one value is greater than another.
     * @param value			The value that should be greater.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThan(Date value, Date compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) > 0) {
            Reporter.logPass("Assert Greater Than", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than", failMessage);
            throw new AssertionError(failMessage);
        }
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThanOrEqual(Number value, Number compareTo) {
    	isGreaterThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThanOrEqual(String value, String compareTo) {
    	isGreaterThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isGreaterThanOrEqual(Date value, Date compareTo) {
    	isGreaterThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThanOrEqual(Number value, Number compareTo, String message) {
    	isGreaterThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThanOrEqual(String value, String compareTo, String message) {
    	isGreaterThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isGreaterThanOrEqual(Date value, Date compareTo, String message) {
    	isGreaterThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThanOrEqual(Number value, Number compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.doubleValue() >= compareTo.doubleValue()) {
            Reporter.logPass("Assert Greater Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }

    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThanOrEqual(String value, String compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) >= 0) {
            Reporter.logPass("Assert Greater Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }

    /**
     * Asserts that one value is greater than or equal to another.
     * @param value			The value that should be greater or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isGreaterThanOrEqual(Date value, Date compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) >= 0) {
            Reporter.logPass("Assert Greater Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Greater Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }

    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThan(Number value, Number compareTo) {
    	isLessThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThan(String value, String compareTo) {
    	isLessThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThan(Date value, Date compareTo) {
    	isLessThan(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThan(Number value, Number compareTo, String message) {
    	isLessThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThan(String value, String compareTo, String message) {
    	isLessThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThan(Date value, Date compareTo, String message) {
    	isLessThan(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThan(Number value, Number compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        if (value.doubleValue() < compareTo.doubleValue()) {
            Reporter.logPass("Assert Less Than", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than", failMessage);
            throw new AssertionError(failMessage);
        }
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThan(String value, String compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) < 0) {
            Reporter.logPass("Assert Less Than", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than", failMessage);
            throw new AssertionError(failMessage);
        }
    }
    
    /**
     * Asserts that one value is less than another.
     * @param value			The value that should be lesser.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThan(Date value, Date compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than the value '" + compareTo + "' as expected.";

        Assert.isTrue(value.compareTo(compareTo) < 0, failMessage);
        
        if (value.compareTo(compareTo) < 0) {
            Reporter.logPass("Assert Less Than", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than", failMessage);
            throw new AssertionError(failMessage);
        }
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThanOrEqual(Number value, Number compareTo) {
    	isLessThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThanOrEqual(String value, String compareTo) {
    	isLessThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     */
    public static void isLessThanOrEqual(Date value, Date compareTo) {
    	isLessThanOrEqual(value, compareTo, null, null);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThanOrEqual(Number value, Number compareTo, String message) {
    	isLessThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThanOrEqual(String value, String compareTo, String message) {
    	isLessThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param message   	Message to display for both pass and fail results
     */
    public static void isLessThanOrEqual(Date value, Date compareTo, String message) {
    	isLessThanOrEqual(value, compareTo, message, message);
    }
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThanOrEqual(Number value, Number compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.doubleValue() <= compareTo.doubleValue()) {
            Reporter.logPass("Assert Less Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }    
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThanOrEqual(String value, String compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) <= 0) {
            Reporter.logPass("Assert Less Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }    
    
    /**
     * Asserts that one value is less than or equal to another.
     * @param value			The value that should be lesser or equal.
     * @param compareTo		The value used for comparison.
     * @param passMessage   message to display when the assertion is passed
     * @param failMessage   message to display when the assertion is failed
     */
    public static void isLessThanOrEqual(Date value, Date compareTo, String passMessage, String failMessage) {
    	
        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The value '" + value + "' was expected to be greater than or equal to the value '" + compareTo + "'.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The value '" + value + "' is greater than or equal to the value '" + compareTo + "' as expected.";

        if (value.compareTo(compareTo) <= 0) {
            Reporter.logPass("Assert Less Than or Equal", passMessage);       
        } else {
            Reporter.logFail("Assert Less Than or Equal", failMessage);
            throw new AssertionError(failMessage);
        }
    }    
    
    /**
     * Asserts that if two objects are equal.
     * If not an assertionError will be thrown with the given message
     * @param actual   actual value
     * @param expected expected value
     */
    public static void areEqual(Object actual, Object expected) {
    	areEqual(actual, expected, null, null);
    }

    
    /**
     * Asserts that if two objects are equal.
     * If not an assertionError will be thrown with the given message
     * @param actual   actual value
     * @param expected expected value
     * @param message  The message to display in both pass and fail log messages.
     */
    public static void areEqual(Object actual, Object expected, String message) {
    	areEqual(actual, expected, message, message);
    }

    /**
     * Asserts that if two objects are equal.
     * If not an assertionError will be thrown with the given message
     * @param actual   		actual value
     * @param expected 		expected value
     * @param passMessage  	The message to display if the test passes.
     * @param failMessage  	The message to display if the test fails.
     */
    public static void areEqual(Object actual, Object expected, String passMessage, String failMessage) {
        String stepName = "Assert Are Equal";
        if (failMessage == null)
            org.testng.Assert.assertEquals(actual, expected);
        else
            org.testng.Assert.assertEquals(actual, expected, failMessage);
        if (passMessage == null)
        	Reporter.logPass(stepName, "The provided values are equal, as expected.  Actual = '" + actual + "'; Expected = '" + expected + "'.");
        else
        Reporter.logPass(stepName, passMessage);
    }

    /**
     * Asserts that if two objects are not equal.
     * If not an assertionError will be thrown with the given message
     * @param actual   actual value
     * @param expected expected value
     */
    public static void areNotEqual(Object actual, Object expected) {
    	areNotEqual(actual, expected, null, null);
    }

    /**
     * Asserts that if two objects are not equal.
     * If not an assertionError will be thrown with the given message
     * @param actual   actual value
     * @param expected expected value
     * @param message  The message to display in both pass and fail log messages.
     */
    public static void areNotEqual(Object actual, Object expected, String message) {
    	areNotEqual(actual, expected, message, message);
    }

    /**
     * Asserts that if two objects are not equal.
     * If not an assertionError will be thrown with the given message
     * @param actual1   	First value to test
     * @param actual2 		Second value to test
     * @param passMessage  	The message to display if the test passes.
     * @param failMessage  	The message to display if the test fails.
     */
    public static void areNotEqual(Object actual1, Object actual2, String passMessage, String failMessage) {
        String stepName = "Assert Are Not Equal";
        if (failMessage == null)
            org.testng.Assert.assertNotEquals(actual1, actual2);
        else
            org.testng.Assert.assertNotEquals(actual1, actual2, failMessage);
        if(passMessage != null)
        	Reporter.logPass(stepName, "The provided values not are equal, as expected.  First Value = '" + actual1 + "'; Second Value = '" + actual2 + "'.");
        else
        	Reporter.logPass(stepName, passMessage);
    }

    /**
     * Asserts that a given object is null.
     * @param value			The value to test.
     */
    public static void isNull(Object value) {
    	isNull(value, null);
    }
    
    /**
     * Asserts that a given object is null.
     * @param value		The value to test.
     * @param message	The message to display in both pass and fail log messages
     */
    public static void isNull(Object value, String message) {
    	isNull(value, message, message);
    }

    /**
     * Asserts that a given object is null.
     * @param value			The value to test.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void isNull(Object value, String passMessage, String failMessage) {
    	String stepName = "Assert Is Null";
    	if (value == null) {
    		if (passMessage == null)
    			passMessage = "The value was null, as expected.";
    		Reporter.logPass(stepName,  passMessage);
    	} else {
        	if (failMessage == null)
        		failMessage = "The following value was expected to be null but was not: " + value.toString();
        	Reporter.logFail(stepName, failMessage);
        	throw new AssertionError(failMessage);
    	}
    }
    
    /**
     * Asserts that a given object is not null.
     * @param value			The value to test.
     */
    public static void isNotNull(Object value) {
    	isNotNull(value, null);
    }
    
    /**
     * Asserts that a given object is not null.
     * @param value		The value to test.
     * @param message	The message to display in both pass and fail log messages
     */
    public static void isNotNull(Object value, String message) {
    	isNotNull(value, message, message);
    }

    /**
     * Asserts that a given object is not null.
     * @param value			The value to test.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void isNotNull(Object value, String passMessage, String failMessage) {
    	String stepName = "Assert Is Not Null";
    	if (value != null) {
    		if (passMessage == null)
    			passMessage = "The following value was not null, as expected: " + value.toString();
    		Reporter.logPass(stepName,  passMessage);
    	} else {
        	if (failMessage == null)
        		failMessage = "The given object was null when it should not have been";
        	Reporter.logFail(stepName, failMessage);
        	throw new AssertionError(failMessage);
    	}
    }
    
    /**
     * Asserts that a given string is empty or filled with white space.
     * @param value			The value to test.
     */
    public static void isEmpty(String value) {
    	isEmpty(value, null);
    }
    
    /**
     * Asserts that a given string is empty or filled with white space.
     * @param value		The value to test.
     * @param message	The message to display in both pass and fail log messages
     */
    public static void isEmpty(String value, String message) {
    	isEmpty(value, message, message);
    }

    /**
     * Asserts that a given string is empty or filled with white space.
     * @param value			The value to test.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void isEmpty(String value, String passMessage, String failMessage) {
    	String stepName = "Assert Is Empty";
    	if (value != null && value.trim().isEmpty()) {
    		if (passMessage == null)
    			passMessage = "The value was empty, as expected.";
    		Reporter.logPass(stepName,  passMessage);
    	} else {
        	if (failMessage == null) {
        		if (value == null)
        			failMessage = "The value was expected to be empty but was null instead (not the same as empty).";
        		else
        			failMessage = "The following value was expected to be empty but was not: " + value;
        	}
        	Reporter.logFail(stepName, failMessage);
        	throw new AssertionError(failMessage);
    	}
    }
    
    /**
     * Asserts that a given string is not empty or filled with white space.
     * @param value			The value to test.
     */
    public static void isNotEmpty(String value) {
    	isNotEmpty(value, null);
    }
    
    /**
     * Asserts that a given string is not empty or filled with white space.
     * @param value		The value to test.
     * @param message	The message to display in both pass and fail log messages
     */
    public static void isNotEmpty(String value, String message) {
    	isNotEmpty(value, message, message);
    }

    /**
     * Asserts that a given string is not empty or filled with white space.
     * @param value			The value to test.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void isNotEmpty(String value, String passMessage, String failMessage) {
    	String stepName = "Assert Is Not Empty";
    	if (value == null) {
        	if (failMessage == null)
        		failMessage = "The given value was null when it was expected to be populated with a non-empty value.";
        	Reporter.logFail(stepName, failMessage);    		
        	throw new AssertionError(failMessage);
    	} else if (value.trim().isEmpty()) {
        	if (failMessage == null)
        		failMessage = "The given value was empty when it was expected to be populated with a non-empty value.";
        	Reporter.logFail(stepName, failMessage);
        	throw new AssertionError(failMessage);
    	} else {
    		if (passMessage == null)
    			passMessage = "The following value was not empty, as expected: " + value.toString();
    		Reporter.logPass(stepName,  passMessage);
    	}
    }
    
    /**
     * Asserts that the text of the given web element contains another sub-string of text.
     * @param element 	web element
     * @param findText	The text to find.
     */
    public static void contains(WebElement element, String findText) {
    	contains(element, findText, null, null);
    }

    /**
     * Asserts that the text of the given web element contains another sub-string of text.
     * @param element 	web element
     * @param findText	The text to find.
     * @param message	The message to display for both pass and fail log messages.
     */
    public static void contains(WebElement element, String findText, String message) {
    	contains(element, findText, message, message);
    }
    
    /**
     * Asserts that the text of the given web element contains another sub-string of text.
     * @param element		web element
     * @param findText		The text to find.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void contains(WebElement element, String findText, String passMessage, String failMessage) {
    	String searchText = element.getText();
    	contains(searchText, findText, passMessage, failMessage);
    }

    /**
     * Asserts that a given string of text contains another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text to find.
     */
    public static void contains(String searchText, String findText) {
    	contains(searchText, findText, null, null);
    }

    /**
     * Asserts that a given string of text contains another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text to find.
     * @param message		The message to display for both pass and fail log messages.
     */
    public static void contains(String searchText, String findText, String message) {
    	contains(searchText, findText, message, message);
    }
    
    /**
     * Asserts that a given string of text contains another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text to find.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void contains(String searchText, String findText, String passMessage, String failMessage) {
        String stepName = "Assert Contains Text";
        if (searchText == null)
        	throw new IllegalArgumentException("You must specify the text to search.");

        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The text '" + searchText + "' does not contain the text '" + findText + "' and was not expected.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The text '" + searchText + "' contains the text '" + findText + "' as expected.";

        if (searchText.contains(findText)){
        	Reporter.logPass(stepName, passMessage);}
        else{
            Reporter.logError(stepName, failMessage);
        	throw new AssertionError(failMessage);  }
    }

    /**
     * Asserts that the text of the given web element does not contain another sub-string of text.
     * @param element 		web element
     * @param findText		The text that should not be found.
     */
    public static void doesNotContain(WebElement element, String findText) {
    	contains(element, findText, null, null);
    }

    /**
     * Asserts that the text of the given web element does not contain another sub-string of text.
     * @param element 		web element
     * @param findText		The text that should not be found.
     * @param message		The message to display for both pass and fail log messages.
     */
    public static void doesNotContain(WebElement element, String findText, String message) {
    	contains(element, findText, message, message);
    }
    
    /**
     * Asserts that the text of the given web element does not contain another sub-string of text.
     * @param element 		web element
     * @param findText		The text that should not be found.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void doesNotContain(WebElement element, String findText, String passMessage, String failMessage) {
    	String searchText = element.getText();
    	contains(searchText, findText, passMessage, failMessage);
    }
    
    /**
     * Asserts that a given string of text does not contain another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text that should not be found.
     */
    public static void doesNotContain(String searchText, String findText) {
    	doesNotContain(searchText, findText, null, null);
    }

    /**
     * Asserts that a given string of text does not contain another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text that should not be found.
     * @param message		The message to display for both pass and fail log messages.
     */
    public static void doesNotContain(String searchText, String findText, String message) {
    	doesNotContain(searchText, findText, message, message);
    }
    
    /**
     * Asserts that a given string of text does not contain another sub-string of text.
     * @param searchText    The text to verify.
     * @param findText		The text that should not be found.
     * @param passMessage	The message to display if the test passes.
     * @param failMessage	The message to display if the test fails.
     */
    public static void doesNotContain(String searchText, String findText, String passMessage, String failMessage) {
    	
        String stepName = "Assert Does Not Contain Text";
        if (searchText == null)
        	throw new IllegalArgumentException("You must specify the text to search.");

        // Include actual/expected details in pass or fail messages
        failMessage = (failMessage == null ? "" : failMessage + "; ") + "The text '" + searchText + "' contains the text '" + findText + "' and was not expected.";
        passMessage = (passMessage == null ? "" : passMessage + "; ") + "The text '" + searchText + "' does not contain the text '" + findText + "' as expected.";

        if (searchText.contains(findText))
        	throw new AssertionError(failMessage);
        else
        	Reporter.logPass(stepName, passMessage);    	
    }

	/**
	 * Asserts that the given list is sorted in ascending order.
	 * @param listOfItems 	The list of items that are to be checked.
	 */
	public static void isSortedInAscendingOrder(List<String> listOfItems) {
		isSortedInAscendingOrder(listOfItems, null, null);
	}
	    
	/**
	 * Asserts that the given list is sorted in ascending order.
	 * @param listOfItems 	The list of items that are to be checked.
	 * @param message		The message to display for both pass and fail log messages.
	 */
	public static void isSortedInAscendingOrder(List<String> listOfItems, String message) {
		isSortedInAscendingOrder(listOfItems, message, message);
	}
	
	/**
	 * Asserts that the given list is sorted in ascending order.
	 * @param listOfItems 	The list of items that are to be checked.
	 * @param passMessage	The message to display if a test passes.
	 * @param failMessage	The message to display if a test fails.
	 */
	public static void isSortedInAscendingOrder(List<String> listOfItems, String passMessage, String failMessage) {

		if (listOfItems == null)
			throw new IllegalArgumentException("You must specify a list of items to test.");
		
		String stepName = "Assert List Sorted (Ascending)";
		
		// Build a new list with the same entries and sort them.  To make sure items are sorted ignoring case, each item is con
		List<String> sortedList = new ArrayList<>(listOfItems);
		Collections.sort(sortedList, String.CASE_INSENSITIVE_ORDER);
		
		if(listOfItems.equals(sortedList)) {
			// All entries are identical
			Reporter.logPass(stepName, (passMessage == null ? "Values are sorted in ascending order." : passMessage));
		} else {
			// Log the entries where the sort does not match expectations
			StringBuilder outputList = new StringBuilder();
			for (int i = 0; i < listOfItems.size(); i++) {
				String expected = sortedList.get(i);
				String actual = listOfItems.get(i);
				outputList.append("<br/>").append(actual);
				if (!expected.equals(actual)) {
					outputList.append("  <font color=\"red\">*** [Expected '" + expected + "'] ***</font>");
				}
			}
			Reporter.logFail(stepName, "List items are not sorted in ascending order:<br/>" + outputList.toString(), false);
			throw new AssertionError((failMessage == null ? "Values are not sorted in ascending order." : failMessage));
		}
	}

    /**
     * Asserts that the given values are exactly same and returns the result
     * This method is added to be used with built-in SoftAssert assert methods
     * @param actualValue 	The list of items that are to be checked.
     * @param expectedValue	The message to display if a test passes.
     * returns boolean
     */
    public boolean areValuesSame(String actualValue, String expectedValue){
        String passMessage = "The text '" + actualValue + "' is same as '" + expectedValue + "'";
        String failMessage = "The text '" + actualValue + "' does not match with '" + expectedValue + "'";
        boolean result = false;
        if(actualValue.equals(expectedValue)){
            Reporter.logPass("", passMessage);
            result = true;
        } else{
            Reporter.logFail("", failMessage);
        }
        return result ;
    }




}
