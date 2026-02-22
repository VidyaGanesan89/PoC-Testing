package data;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

/**
 * Defines methods useful for working with dates.
 */
public class DateHelper {

	/**
	 * Gets the current date/time represented as local time.
	 * @return	The current date/time.
	 */
	public static Date getCurrentDateTime() {
		return Calendar.getInstance().getTime();
	}

	/**
	 * Gets the current date/time represented as local time.
	 * @return	The current date/time in the given string format.
	 */
	public static String getCurrentDateTimeFormatted(String format) {
		return formatDate(getCurrentDateTime(), format);
	}

	/**
	 * Gets a date that is the specified number of days in the future.
	 * @return	Returns the newly generated date.
	 */
	public static Date getFutureDate(int numberOfDays) {
		return addDays(getCurrentDateTime(), numberOfDays);
	}

	/**
	 * Gets a date in that is the specified number of days in the future.
	 * @return	Returns the newly generated date in the given string format.
	 */
	public static String getFutureDateFormatted(int numberOfDays, String format) {
		Date futureDate = getFutureDate(numberOfDays);
		return formatDate(futureDate, format);
	}

	/**
	 * Gets a date that is the specified number of days in the past.
	 * @return	Returns the newly generated date.
	 */
	public static Date getPriorDate(int numberOfDays) {
		return addDays(getCurrentDateTime(), numberOfDays * -1);
	}

	/**
	 * Gets a date in that is the specified number of days in the past.
	 * @return	Returns the newly generated date in the given string format.
	 */
	public static String getPriorDateFormatted(int numberOfDays, String format) {
		Date priorDate = getPriorDate(numberOfDays);
		return formatDate(priorDate, format);
	}

	/**
	 * Tries to parse a string of text into a date using the given expected format of the text.
	 * @param dateText		The date text to be parsed.
	 * @param format		The format the date text is displayed in.
	 * @return				If successful, returns the parsed date; otherwise returns null.
	 */
	public static Date tryParseDate(String dateText, String format) {
		try {
			return parseDate(dateText, format);
		} catch (ParseException e) {
			return null;
		}
	}

	/**
	 * Parses a string of text into a date using the given expected format of the text.
	 * @param dateText	The date text to be parsed
	 * @param format	The format the date text is displayed in
	 * @return			Returns the Date represented by the text
	 * @throws ParseException	Thrown if the text is not recognized in the given format.
	 */
	public static Date parseDate(String dateText, String format) throws ParseException  {
		SimpleDateFormat formatter = new SimpleDateFormat(format);
		Date date = formatter.parse(dateText.trim());
		return date;
	}

	/**
	 * Formats a date in the given format.
	 * @param date		The date to be formatted.
	 * @param format	The format to apply to the date.
	 * @return			Returns the formatted date.
	 */
	public static String formatDate(Date date, String format) {
		return formatDate(date, format, true);
	}

	/**
	 * Formats a date in the given format.
	 * @param date			The date to be formatted.
	 * @param format		The format to apply to the date.
	 * @param useLocalTime	When true, the local system time is used.  Otherwise GMT time is used.
	 * @return				Returns the formatted date.
	 */
	public static String formatDate(Date date, String format, Boolean useLocalTime) {
		SimpleDateFormat formatter = new SimpleDateFormat(format);
		if (!useLocalTime)
			formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
		String dateText = formatter.format(date);
		return dateText;
	}

	/**
	 * Converts a date from one format to another.
	 *
	 * @param inputText			The formatted date text.
	 * @param inputFormat		The format the input is presented in.
	 * @param outputFormat		The new format the date should be converted to.
	 * @return					Returns the date in the new format.
	 * @throws ParseException	Thrown if the input text is not recognized in the given format.
	 */
	public static String changeDateFormat(String inputText, String inputFormat, String outputFormat) throws ParseException {
		Date date = parseDate(inputText, inputFormat);
		return formatDate(date, outputFormat);
	}

	/**
	 * Adds the specified number of days to a date.
	 * @param initialDate	The date to which days will be added.
	 * @param numberOfDays	The number of days to add.  Pass a negative value to subtract days.
	 * @return				Returns the newly generated date.
	 */
	public static Date addDays(Date initialDate, int numberOfDays) {
		if (initialDate == null)
			throw new IllegalArgumentException("You must specify 'initialDate'.");

		// Initialize a calendar to the given time
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(initialDate);

		// Adjust the days
		calendar.add(Calendar.DATE, numberOfDays);

		// Return the new date
		Date date = calendar.getTime();
		return date;
	}

	public static String getCurrentTimeInUTC() {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
		df.setTimeZone(tz); // strip timezone
		return df.format(new Date());
	}

	public static String getCurrentTimeInUtcFormatted(String pattern) {
		TimeZone tz = TimeZone.getTimeZone("UTC");
		DateFormat df = new SimpleDateFormat(pattern);
		df.setTimeZone(tz); // strip timezone
		return df.format(new Date());
	}

	public static void calendarConversionsDifferingTimeZones() throws ParseException {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HHmmss SSS");
		Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC+0"));
		calendar.setTime(sdf.parse("20180115 153256 001"));
	}

	public static String getPastHoursTime(int numberOfHours, String timezone) {
		ZonedDateTime instant = Instant.now()
				.atZone(ZoneId.of(timezone))
				.minusHours(numberOfHours);
		return instant.toString();
	}

	public static String getPastHoursTimeinUTC(int numberOfHours) {
		return Instant.now().minus(numberOfHours , ChronoUnit.HOURS).toString();
	}

	public static String getPastMinutesTimeinUTC(int numberOfMinutes) {
		return Instant.now().minus(numberOfMinutes , ChronoUnit.MINUTES).toString();
	}



}
