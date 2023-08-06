const { Builder, Browser, By, Key, until } = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");

const cron = require("node-cron");

/* An array of objects that represents the upcoming birthdays. 
Each object in the array represents a person's birthday and contains the following properties: */
const upcomingBirthdays = [
	{
		name: "User1", // contact name
		date: 6, // birth date
		month: 8, // birth month
	},
    {
		name: "User2", // contact name
		date: 7, // birth date
		month: 8, // birth month
	},
];

// Note: ^ Provide exact name as per the saved contact

/**
 * Generates a birthday message for a given name. Message can be modified as per the need.
 * @param name - The name parameter is a string that represents the name of the person whose birthday
 * it is.
 * @returns {string} - Birthday message
 */
const birthdayMessage = (name) => `Happy Birthday, ${name}`;

async function sendBirthdayWishes() {
	/* Configure the options and settings for the Chrome browser when using WebDriver. */
	const options = new Chrome.Options();

	/* Add a command line argument to the Chrome browser options to specify the directory where the user
    data for the Chrome browser should be stored. It allows the WebDriver to use a specific profile for the Chrome browser session. 
    This can be useful for preserving user settings, cookies, and other data between different runs of the WebDriver. */
	options.addArguments("--user-data-dir=chrome-data");

	/* Create instance of the WebDriver for Chrome browser. */
	const driver = new Builder()
		.forBrowser(Browser.CHROME)
		.setChromeOptions(options)
		.build();

	const todaysDate = new Date().getDate(); // returns today's date
	const ongoingMonth = new Date().getMonth() + 1; // return ongoing month

	/* Filter the `upcomingBirthdays` array to find the birthdays that match today's date and month. */
	const todaysBirthday = upcomingBirthdays.filter(
		(birthdayInfo) =>
			birthdayInfo.date === todaysDate &&
			birthdayInfo.month === ongoingMonth
	);

	try {
		/* Maximize the browser window to its full size. */
		driver.manage().window().maximize();

		/* `Instruct the web driver to navigate to the URL "https://web.whatsapp.com". 
        This opens the WhatsApp Web application in the browser. */
		driver.get("https://web.whatsapp.com");

        /* NOTE: You will need to scan QR code through phone for first time ONLY, 
        your chrome profile will reuse it from (--user-data-dir directory) next time onwards */

		for (let birthdayInfo of todaysBirthday) {
			/* Locate the search input textbox element using a CSS selector. */
			const searchEl = driver.wait(
				until.elementLocated(
					By.css('div[title="' + "Search input textbox" + '"]')
				)
			);

			/* Simulate a click action on the search input textbox element. 
            This action is performed to activate the search input textbox and
            make it ready for user input. */
			searchEl.click();

			/* Simulate a user action of typing the the name of the person whose birthday it is into the 
            search input textbox on the WhatsApp Web page. */
			searchEl.sendKeys(birthdayInfo.name, Key.RETURN);

			/* Pause the execution of the code for 2s (Can be increased a bit if required). 
            To allow time for certain actions to complete before proceeding to the next step. */
			await driver.sleep(2000);

			/* Locate the element that represents the contact with the name specified in `birthdayInfo.name`. */
			const usernameEl = driver.wait(
				until.elementLocated(
					By.css('span[title="' + birthdayInfo.name + '"]')
				)
			);

			usernameEl.click();

			await driver.sleep(2000);

			/* Locate the element that represents the input textbox where the user can type a message. */
			const sendMessageEl = driver.wait(
				until.elementLocated(
					By.css('div[title="' + "Type a message" + '"]')
				)
			);

			sendMessageEl.click();

			/* Simluate a user action of typing a birthday message into the input textbox page 
            and pressing the Enter key to send the message. */
			await sendMessageEl.sendKeys(
				birthdayMessage(birthdayInfo.name),
				Key.RETURN
			);

			await driver.sleep(2000);
		}
	} catch (err) {
		console.log("err", err); // Log err
	} finally {
		/* Close the WebDriver and terminate the browser session. */
		driver.quit();
	}
}

/* Schedule a task to run at specific intervals using node-cron. 
In this case, the cron expression `"0 0 0 * * *"` specifies that the task will run at 12 AM every day */
cron.schedule("0 0 0 * * *", () => {
	sendBirthdayWishes();
});
