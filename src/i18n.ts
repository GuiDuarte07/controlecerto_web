import { getRequestConfig } from "next-intl/server";

const appLocales = ["en", "pt"] as const;
const defaultLocale = "pt";

type AppLocale = (typeof appLocales)[number];

function isAppLocale(locale: string): locale is AppLocale {
  return appLocales.includes(locale as AppLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale =
    requestedLocale && isAppLocale(requestedLocale)
      ? requestedLocale
      : defaultLocale;

  return {
    locale,
    messages: (await import(`./translations/${locale}.json`)).default,
  };
});
