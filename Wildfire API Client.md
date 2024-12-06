
# 🌟 Wildfire API Client Documentation

---

## 🔍 Overview
The **Wildfire API Client** is a TypeScript library that simplifies interaction with the **Wildfire API**. It provides functionality for:

- **Device registration**
- **Cloud profile management**
- **Gift card balance management**
- **Transaction handling**

---

## 🚀 Installation
Install the Wildfire API Client using npm:

```bash
npm install wildfire-api-client
```

---

## 🔧 Environment Variables

To use the Wildfire API client, you need to set the following environment variables:

- `WILDFIRE_APP_ID`: Your application ID for accessing the Wildfire API.
- `WILDFIRE_APP_SECRET`: Your application secret for accessing the Wildfire API.
- `WILDFIRE_ADMIN_APP_ID`: Your admin application ID for accessing the Wildfire API.
- `WILDFIRE_ADMIN_APP_SECRET`: Your admin application secret for accessing the Wildfire API.

### Setting Environment Variables

You can set these environment variables in your shell configuration file (e.g., `.bashrc`, `.zshrc`):

```bash
export WILDFIRE_APP_ID=your_app_id
export WILDFIRE_APP_SECRET=your_app_secret
export WILDFIRE_ADMIN_APP_ID=admin_app_id
export WILDFIRE_ADMIN_APP_SECRET=admin_app_secret
```

Alternatively, you can use a `.env` file with the `dotenv` package:

1. Install `dotenv`:

   ```bash
   npm install dotenv
   ```

2. Create a `.env` file in your project root:

   ```
    WILDFIRE_APP_ID=your_app_id
    WILDFIRE_APP_SECRET=your_app_secret
    WILDFIRE_ADMIN_APP_ID=admin_app_id
    WILDFIRE_ADMIN_APP_SECRET=admin_app_secret
   ```

3. Load the environment variables in your client code:

   ```javascript
   require('dotenv').config();
   const wildfireApiClient = require('wildfire-api-client');
   ```

---

## 📖 Usage

### 🔗 Importing the Client
To start using the client, import it into your project:

```typescript
import { WildfireClient } from 'wildfire-api-client';
```

### 🏗️ Creating a Client Instance
Create an instance of the client easily:

```typescript
const client = await WildfireClient.create();
```

---

## 📱 Device Management

### ➕ Creating a Device
Register a new device with the following method:

```typescript
const device = await client.createDevice(deviceKey, deviceToken, isAdminDevice);
```

- **deviceKey** _(optional)_: Unique identifier for the device.
- **deviceToken** _(optional)_: Token for the device.
- **isAdminDevice** _(optional)_: Indicates if the device has admin privileges.

---

### 📝 Registering a Device
Link a device to a customer ID:

```typescript
await client.registerDevice(mlCustomerId, deviceToken, isAdminDevice);
```

- **mlCustomerId**: Customer's unique identifier.
- **deviceToken**: Device token.
- **isAdminDevice** _(optional)_: Indicates admin access.

---

## ☁️ Fetching Cloud Profile
Retrieve the cloud profile for a device:

```typescript
const cloudProfile = await client.getCloudProfile(deviceKey);
```

- **deviceKey**: Unique key for the device.

---

## 🎁 Managing Gift Cards

### 💵 Getting Redeemable Amount
Check the available balance for a device:

```typescript
const redeemableAmount = await client.getRedeemableAmount(deviceId);
```

- **deviceId**: Identifier for the device.

---

### 🕒 Viewing Redemption History
View a record of previous redemptions:

```typescript
const redemptionHistory = await client.getRedemptionHistory(deviceId);
```

- **deviceId**: Identifier for the device.

---

### 🎉 Redeeming Gift Cards
Redeem a gift card balance:

```typescript
const redeemResponse = await client.redeemGiftCard(deviceId);
```

- **deviceId**: Identifier for the device.

---

## ⚠️ Error Handling
The Wildfire API Client has custom error-handling features for smooth debugging.

### 🔧 Handling `WildfireApiError`
Capture and handle API-related errors:

```typescript
import { WildfireApiError } from 'wildfire-api-client';

try {
  // API call
} catch (error) {
  if (error instanceof WildfireApiError) {
    console.error('API Error:', error.message);
  }
}
```

---

## 🏗️ Types
The Wildfire API Client includes helpful TypeScript interfaces to structure your data.

### 📑 Common Interfaces

#### `WildfireDevice`
```typescript
interface WildfireDevice {
  DeviceID: number;
  DeviceKey: string;
  DeviceToken: string;
}
```

#### `WildfireAuthHeaders`
```typescript
interface WildfireAuthHeaders extends Record<string, string> {
  Authorization: string;
  'X-WF-DateTime': string;
  'Content-Type': 'application/json';
}
```

#### `WildfireErrorResponse`
```typescript
interface WildfireErrorResponse {
  ErrorMessage: string;
}
```

#### `WildfireRedeemableAmountResponse`
```typescript
interface WildfireRedeemableAmountResponse {
  Amount: string;
  Currency: string;
}
```

#### `WildfireCloudProfile`
```typescript
interface WildfireCloudProfile {
  CommissionStatsSummary: WildfireCommissionStatsSummary;
  CommissionStatsDetail: WildfireCommissionDetail[];
  Notifications: string;
  Metadata: WildfireCloudProfileMetadata;
}
```

---

## 🤝 Contributing
Contributions are welcome! Submit an issue or open a pull request on GitHub.

---

## 📜 License
This project is licensed under the **ISC License**. See the `LICENSE` file for details.

---

## 📬 Contact
Have questions or issues? Reach out to **Shane** at:  
📧 **shane.boyar@missionlane.com**

---
