package dataprovider;


import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

public class ReadCsv {

	public static Iterator<Object[]> getCsvData(String fileName) {

		List<Object[]> csvData = new ArrayList<Object[]>();
		File file = new File(fileName);

		BufferedReader br = null;
		String line = "";
		try {
			br = new BufferedReader(new FileReader(file));
			line = br.readLine();
			while (line != null) {

				// use comma as separator
				Object[] token = line.split(",");
				if (token[0].equals("Y")) {
					
					//for ignoring 1st column(flag0)
					Object[] tokensWithoutFlag = new String[token.length - 1];

					for (int i = 1; i < token.length; i++) {
						tokensWithoutFlag[i - 1] = token[i];
					}
					csvData.add(tokensWithoutFlag);					
					line = br.readLine();
				} else {
					line = br.readLine();
				}
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return csvData.iterator();
	}

	public static List<Object[]> getCsvDataAsListOfObject(String filePath) {
		List<Object[]> csvData = new ArrayList<>();
		File file = new File(filePath);

		BufferedReader reader = null;
		String line = "";
		try {
			reader = new BufferedReader(new FileReader(file));
			line = reader.readLine();

			while (line != null) {
				// use comma as separator
				Object[] rowValues = line.split(",");
				csvData.add(rowValues);
				line = reader.readLine();
			}

		} catch (IOException e) {
			e.printStackTrace();

		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return csvData;
	}


	//reads first sheet of the given csv file and returns the data as list of String
	public static List<List<String>> getCsvDataAsListOfList(File file) {
		List<List<String>> csvData = new ArrayList<>();
		BufferedReader reader = null;
		String line = "";
		try {
			reader = new BufferedReader(new FileReader(file));
			line = reader.readLine();

			while (line != null) {
				// use comma as separator
				List<String> rowValues = new ArrayList<>(Arrays.asList(line.split(",")));
				csvData.add(rowValues);
				line = reader.readLine();
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return csvData;
	}

}
