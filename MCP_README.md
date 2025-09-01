# MCP Server Configuration for Render

This project includes MCP (Model Context Protocol) server configuration for deploying and managing the Formula 1 Chatter application on Render.

## Files

- `mcp.json` - Basic MCP configuration
- `mcp-render.json` - Comprehensive MCP configuration with additional options

## Setup

### 1. Get Your Render API Key

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Navigate to Account Settings → API Keys
3. Create a new API key
4. Copy the API key

### 2. Configure MCP Server

Replace `<YOUR_API_KEY>` in either `mcp.json` or `mcp-render.json` with your actual Render API key:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

### 3. Environment Variables

Make sure your Render service has the following environment variables set:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_DB=formula1chatter
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# Optional
UPDATE_PROFILE_PICTURES_ON_STARTUP=false
```

## Usage

### Deploy to Render

```bash
# Using the MCP server
mcp render deploy

# Or manually trigger deployment
curl -X POST "https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### View Logs

```bash
# Using the MCP server
mcp render logs

# Or manually fetch logs
curl "https://api.render.com/v1/services/YOUR_SERVICE_ID/logs" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Check Service Status

```bash
# Using the MCP server
mcp render status

# Or manually check status
curl "https://api.render.com/v1/services/YOUR_SERVICE_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## MCP Server Capabilities

The Render MCP server provides the following capabilities:

- **Deployment**: Deploy new versions of your application
- **Logs**: View application logs in real-time
- **Environment**: Manage environment variables
- **Scaling**: Scale your service up or down
- **Monitoring**: Check service health and performance

## Security Notes

- Never commit your actual API key to version control
- Use environment variables for sensitive configuration
- Regularly rotate your API keys
- Limit API key permissions to only what's necessary

## Troubleshooting

### Common Issues

1. **Authentication Error**: Verify your API key is correct and has the right permissions
2. **Service Not Found**: Check that the service ID in your configuration matches your Render service
3. **Deployment Failed**: Check the build logs for compilation or dependency issues

### Getting Help

- [Render Documentation](https://render.com/docs)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Render Support](https://render.com/support)
