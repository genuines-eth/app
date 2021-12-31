// Matthias Behr (c), 2021

/**
 * return a "safe", i.e. ascii only domain name from an url
 * This will return undefined if the domain name is an IDN using
 * unicode.
 * As only ascii is supported the returned name is lower cased as well.
 * Any preceding https: or http: are removed.
 * www. is removed as well.
 * @param url
 */

export function safeDomainNameFromUrl(url: string): string | undefined {

    let domainName: string = url.toLowerCase();
    if (domainName) {
        domainName = domainName.replace("https://", "");
        domainName = domainName.replace("http://", "");
        if (domainName.startsWith("www.")) {
            domainName = domainName.substring(4);
        }
        let posOfSlash = domainName.indexOf("/");
        if (posOfSlash >= 0) {
            domainName = domainName.substring(0, posOfSlash);
        }
        if (domainName.length < 1) { return undefined; }
        // now check that domainName contains only ascii chars
        for (let i = 0; i < domainName.length; i++) {
            if (domainName.charCodeAt(i) > 127) {
                return undefined;
            }
        }
        return domainName;
    }
    return undefined;
}

// from https://stackoverflow.com/a/55852057
const IsEmailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

/**
 * return whether a string is a valid email addr.
 */
export function isEmailAddr(email: string): boolean {
    return IsEmailRegex.test(email);
}