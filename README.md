# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

<!-- 

[API] Found 1 eligible tow trucks. Broadcasting request...
🔴 [API] CRITICAL ERROR in /request-towing: PrismaClientKnownRequestError:
Invalid `prisma.booking.create()` invocation in
C:\prjs\afthuliftme\api\bookings.ts:829:53

  826 const eligibleProviderIds = eligibleTrucks.map(truck => truck.id);
  827 const basePrice = eligibleTrucks[0].services[0].price; // Use price from the first eligible truck as a baseline
  828
→ 829 const newBooking = await prisma.booking.create(
Unique constraint failed on the constraint: `bookings_paymentIntentId_key`
    at $n.handleRequestError (C:\prjs\afthuliftme\api\node_modules\@prisma\client\runtime\library.js:121:7315)
    at $n.handleAndLogRequestError (C:\prjs\afthuliftme\api\node_modules\@prisma\client\runtime\library.js:121:6623)
    at $n.request (C:\prjs\afthuliftme\api\node_modules\@prisma\client\runtime\library.js:121:6307)
    at l (C:\prjs\afthuliftme\api\node_modules\@prisma\client\runtime\library.js:130:9633)
    at C:\prjs\afthuliftme\api\bookings.ts:829:32 {
  code: 'P2002',
  clientVersion: '5.22.0',
  meta: { modelName: 'Booking', target: 'bookings_paymentIntentId_key' } -->


   The BookingModal and accepting the booking and when clicking the bookingCard does not function inside the  @app/\(root\)/\(tabs\)/settings/add-business/tow-truck-dashboard.tsx  but  it does work coorectly inside @app/\(root\)/\(tabs\)/settings/add-business/garage-dashboard.tsx  and I want to have the same features and details there, and the card to function correctly like it does in garage dashboard. Like the booking card should have same details in the modal and the card like it does in garage dashboard, and inside towtruck it should show the pickup location as well as the destination and the distance between them and stuff. CAn you do that?                                     