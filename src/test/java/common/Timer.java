package common;

import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Defines a class for tracking elapsed time.
 * @author Amrutharaja
 *
 */
public class Timer {

	private long startTime;
	private long timeoutSeconds;
	
	/**
	 * Initializes a new instance of the Timer class without any timeout defined.
	 */
	public Timer() {
		Reset();
	}
	
	/**
	 * Initializes a new instance of the Timer class with a defined timeout.
	 * @param timeoutSeconds	The time, in seconds, after which a timeout occurs
	 */
	public Timer(long timeoutSeconds) {
		this();
		this.timeoutSeconds = timeoutSeconds;
	}
	
	/**
	 * Gets the current timeout, in seconds.
	 * @return	The timeout, in seconds.
	 */
	public long getTimeoutSeconds() {
		return timeoutSeconds;
	}
	
	/**
	 * Sets the current timeout, in seconds.
	 * @param seconds	The time, in seconds, for the timeout.
	 */
	public void setTimeoutSeconds(int seconds) {
		this.timeoutSeconds = Math.max(0, seconds); 
	}
	
	/**
	 * Gets the total number of elapsed seconds since the timer was initializes or the last reset.
	 * @return	The total elapsed seconds.
	 */
	public long getElapsedSeconds() {
		long elapsedSeconds = TimeUnit.MILLISECONDS.toSeconds(new Date().getTime() - startTime);
		return elapsedSeconds;
	}
	
	/**
	 * Resets the timer to zero elapsed seconds.
	 */
	public void Reset() {
		startTime = new Date().getTime();
	}
	
	/**
	 * Tests if the timer has timed out (i.e. elapsed time meets or exceeds the defined timeout).
	 * @return	true if the timer has timed out; otherwise false.
	 */
	public boolean isTimedOut() {
		return getElapsedSeconds() >= getTimeoutSeconds();
	}
	
}
