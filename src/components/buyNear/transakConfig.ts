export default function getTransakConfig(
  accountId: string,
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        apiKey: "bf2238a1-ff5d-4a8f-9e1b-af7892ed0123",
        environment: "PRODUCTION",
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== "undefined" ? window.location.origin : ``,
        defaultCryptoCurrency: "NEAR",
        cryptoCurrencyCode: "NEAR",
        walletAddress: accountId || "",
      };
    case "development":
    case "pub-testnet":
      return {
        apiKey: "538c522e-474e-4d3b-a7a2-38a736cea747",
        environment: "STAGING",
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== "undefined" ? window.location.origin : ``,
        defaultCryptoCurrency: "NEAR",
        cryptoCurrencyCode: "NEAR",
        walletAddress: accountId || "",
      };
    case "testnet":
      return {
        apiKey: "538c522e-474e-4d3b-a7a2-38a736cea747",
        environment: "STAGING",
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        cryptoCurrencyCode: "NEAR",
        hostURL: typeof window !== "undefined" ? window.location.origin : ``,
        defaultCryptoCurrency: "NEAR",
        walletAddress: accountId || "",
      };
    default:
      return {
        apiKey: "bf2238a1-ff5d-4a8f-9e1b-af7892ed0123",
        environment: "PRODUCTION",
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== "undefined" ? window.location.origin : ``,
        defaultCryptoCurrency: "NEAR",
        cryptoCurrencyCode: "NEAR",
        walletAddress: accountId || "",
      };
  }
}
