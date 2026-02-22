package environment;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class EnvironmentConfig {
	public CommonConfig common;
	public OpenShiftProjectConfig ephemeral;
	public OpenShiftProjectConfig build;
	public OpenShiftProjectConfig parcelpro;
	public OpenShiftProjectConfig integration;
	public OpenShiftProjectConfig insureshield;
	public OpenShiftProjectConfig aboutups;
	public OpenShiftProjectConfig stressWW;
	public OpenShiftProjectConfig stressRR;
	public OpenShiftProjectConfig releaseBuild;
	public OpenShiftProjectConfig releaseIntegration;
	public OpenShiftProjectConfig releaseStressWW;
	public OpenShiftProjectConfig releaseStressRR;
	public OpenShiftProjectConfig releaseUAT;
	public static EnvironmentConfig config;

	public OpenShiftProjectConfig getEnv(String envValue) {
		try {
			switch (envValue) {
			case "integration":
				return integration;
			case "parcelpro":
				return parcelpro;
			case "insureshield":
				return insureshield;
			case "aboutups":
				return aboutups;
			case "stress-ww":
				return stressWW;
			case "stress-rr":
				return stressRR;
			case "release-build":
				return releaseBuild;
			case "release-integration":
				return releaseIntegration;
			case "release-stress-ww":
				return releaseStressWW;
			case "release-stress-rr":
				return releaseStressRR;
			case "release-uat":
				return releaseUAT;
			default:
				return null;
			}
		} catch (Exception e) {

		}

		return build;

	}

	public OpenShiftProjectConfig getEnv() {
		String environment = System.getProperty("environment");
		if (environment == null) {
			environment = common.defaultEnvironment;
		}
		try {
			switch (environment) {
			case "integration":
				return integration;
			case "parcelpro":
				return parcelpro;
			case "insureshield":
				return insureshield;	
			case "stress-ww":
				return stressWW;
			case "stress-rr":
				return stressRR;
			case "release-build":
				return releaseBuild;
			case "release-integration":
				return releaseIntegration;
			case "release-stress-ww":
				return releaseStressWW;
			case "release-stress-rr":
				return releaseStressRR;
			case "release-uat":
				return releaseUAT;
			default:
				return null;
			}
		} catch (Exception e) {

		}
		return null;
	}

	public List<OpenShiftProjectConfig> getEnv1() throws IOException {
		List<OpenShiftProjectConfig> configList = new ArrayList<>();
		String environment = System.getProperty("environment");
		if (environment == null) {
			environment = config.common.defaultEnvironment;
		}
		switch (environment) {
		case "integration":
			configList.add(integration);
			return configList;
		case "parcelpro":
			configList.add(integration);
			return configList;
		case "insureshield":
			configList.add(integration);
			return configList;	
		case "stress-ww":
			configList.add(stressWW);
			configList.add(stressRR);
			return configList;
		case "stress-rr":
			configList.add(stressWW);
			configList.add(stressRR);
			return configList;
		case "release-integration":
			configList.add(releaseIntegration);
			return configList;
		case "release-stress-ww":
			configList.add(releaseStressWW);
			configList.add(releaseStressRR);
			return configList;
		case "release-stress-rr":
			configList.add(releaseStressWW);
			configList.add(releaseStressRR);
			return configList;
		case "release-uat":
			configList.add(releaseUAT);
			return configList;
		default:
			configList.add(ephemeral);
			return configList;
		}
	}

}
