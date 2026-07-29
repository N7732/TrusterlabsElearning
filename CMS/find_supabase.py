import psycopg2
import socket
import sys

REGIONS = [
    'us-east-1', 'us-west-1', 'us-west-2', 'ap-southeast-1', 'ap-southeast-2',
    'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'sa-east-1', 'eu-west-1',
    'eu-west-2', 'eu-central-1', 'ca-central-1', 'eu-west-3', 'eu-north-1',
    'ap-east-1', 'me-south-1', 'af-south-1'
]

PROJECT_REF = 'mccrxglpcsdxlkpebwxo'
PASSWORD = 'DTb1064!Az2'
USER = f'postgres.{PROJECT_REF}'

for region in REGIONS:
    host = f'aws-0-{region}.pooler.supabase.com'
    print(f"Trying {host}...")
    try:
        # First check if host resolves
        socket.gethostbyname(host)
        
        # Try to connect
        
        conn = psycopg2.connect(
            host=host,
            port=5432,
            user=USER,
            password=PASSWORD,
            dbname='postgres',
            connect_timeout=3
        )
        print(f"SUCCESS! Connection established with {host}")
        conn.close()
        sys.exit(0)
    except socket.gaierror:
        # Host doesn't exist
        pass
    except Exception as e:
        if "password authentication failed" in str(e):
            print(f"Auth failed for {host}")
        else:
            print(f"Error for {host}: {str(e)}")

print("Could not find working pooler.")
