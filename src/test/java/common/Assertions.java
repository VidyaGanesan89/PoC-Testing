package common;

/**
 * Common Assertions utility class for custom assertion methods.
 */
public class Assertions {

    /**
     * Assert that two strings are equal.
     *
     * @param actual   The actual value
     * @param expected The expected value
     * @param message  The assertion message
     */
    public static void areEqual(String actual, String expected, String message) {
        try {
            if (actual == null && expected == null) {
                System.out.println("Assertion passed: Both values are null");
                return;
            }
            if (actual == null || expected == null) {
                throw new AssertionError(message + " - One value is null. Actual: " + actual + ", Expected: " + expected);
            }
            if (!actual.equals(expected)) {
                throw new AssertionError(message + " - Values do not match. Actual: '" + actual + "', Expected: '" + expected + "'");
            }
            System.out.println("Assertion passed: " + message);
        } catch (AssertionError e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error during assertion: " + message, e);
        }
    }

    /**
     * Assert that two strings are equal (without custom message).
     *
     * @param actual   The actual value
     * @param expected The expected value
     */
    public static void areEqual(String actual, String expected) {
        areEqual(actual, expected, "String equality assertion");
    }

    /**
     * Assert that a condition is true.
     *
     * @param condition The condition to check
     * @param message   The assertion message
     */
    public static void isTrue(boolean condition, String message) {
        try {
            if (!condition) {
                throw new AssertionError(message + " - Expected condition to be true but was false");
            }
            System.out.println("Assertion passed: " + message);
        } catch (AssertionError e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error during assertion: " + message, e);
        }
    }

    /**
     * Assert that a condition is false.
     *
     * @param condition The condition to check
     * @param message   The assertion message
     */
    public static void isFalse(boolean condition, String message) {
        try {
            if (condition) {
                throw new AssertionError(message + " - Expected condition to be false but was true");
            }
            System.out.println("Assertion passed: " + message);
        } catch (AssertionError e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error during assertion: " + message, e);
        }
    }

    /**
     * Assert that a string contains another string.
     *
     * @param actual   The actual string
     * @param expected The expected substring
     * @param message  The assertion message
     */
    public static void contains(String actual, String expected, String message) {
        try {
            if (actual == null || expected == null) {
                throw new AssertionError(message + " - Null value provided. Actual: " + actual + ", Expected: " + expected);
            }
            if (!actual.contains(expected)) {
                throw new AssertionError(message + " - String does not contain expected value. Actual: '" + actual + "', Expected to contain: '" + expected + "'");
            }
            System.out.println("Assertion passed: " + message);
        } catch (AssertionError e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error during assertion: " + message, e);
        }
    }
}
