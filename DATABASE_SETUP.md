# Database Setup for TrackRights

## Neon Database Configuration

The TrackRights application now uses **Neon PostgreSQL** for data persistence and real-time statistics.

### Project Details

- **Project ID**: `damp-cherry-45994944`
- **Database**: `neondb`
- **Region**: `us-east-2` (AWS)

### Connection String

Add this to your `.env` file:

```
DATABASE_URL=postgresql://neondb_owner:npg_zKGucx46Dfys@ep-withered-dawn-aehjxvwn-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## Database Schema

### Tables Created

1. **contracts**

   - Stores all contract analyses (original, simplified, revised)
   - Tracks processing time and contract type

2. **users**

   - Tracks unique users via session IDs
   - Maintains user statistics (total contracts, first/last active dates)

3. **contract_analyses**
   - Detailed analysis records
   - Links contracts to users
   - Tracks success/failure and processing times

## API Endpoints

### `/api/stats` (GET)

Returns real-time statistics:

- Contracts Analyzed
- Happy Producers (unique users)
- Average Analysis Time
- Accuracy Rate
- Generated Contracts

### `/api/track-contract` (POST)

Tracks contract analyses (called automatically):

- Creates/updates user records
- Saves contract data
- Records analysis metrics

## Features

✅ **Real-time Statistics**: Stats update automatically as users analyze contracts
✅ **User Tracking**: Anonymous user tracking via session cookies
✅ **Performance Metrics**: Tracks processing times for optimization
✅ **Data Persistence**: All contract analyses are stored
✅ **Non-blocking**: Tracking doesn't slow down contract analysis

## Statistics Display

The `ComicBanner` component now:

- Fetches real stats from `/api/stats`
- Auto-refreshes every 30 seconds
- Shows actual user data instead of fake numbers
- Gracefully falls back to defaults if database is unavailable

## Next Steps

1. Add `DATABASE_URL` to your `.env` file
2. Deploy to production with the environment variable
3. Monitor stats in the Neon console: https://console.neon.tech
