interface GAAccount {
	// namespace prefix for _gaq.push methods, ie. 'special'
	prefix?: string;
	// ie. 'UA-32129070-1'
	id: string;
	// sampling percentage, from 1 to 100
	sampleRate: number;
}

interface GAAccountMap {
	[name: string]: GAAccount;
}

interface trackers {
	ua: GAAccountMap;
	quantserve: string;
	comscore: {
		keyword: string;
		id: string;
		c7: string;
		c7Value: string;
	};
	krux: {
		mobileId: string;
	}
}
