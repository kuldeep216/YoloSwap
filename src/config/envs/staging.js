const envConfig = {
  NETWORK_BLOCKCHAIN: 'eos',
  NETWORK_PROTOCOL: 'https',
  NETWORK_PORT: '443',
  NETWORK_ACCOUNT: 'yolonetwork1',
  NETWORK_HOSTS: [
    'user-api.eoseoul.io',
    'mainnet.eoscanada.com',
    'api.eossweden.se',
  ],
  NETWORK_CHAIN_ID: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  TX_URL: 'https://bloks.io/transaction/',
  COINGECKO_URL: 'https://api.coingecko.com/api/v3/',
  API_URL: 'https://staging-yolo-backend.knstats.com/',
  DFUSE_URL: 'https://mainnet.eos.dfuse.io/',
  DFUSE_KEY: 'server_7518c8882426fcbd9357332c57c243af',
  EOS: {
    "id": "eos",
    "name": "EOS",
    "symbol": "EOS",
    "account": "eosio.token",
    "precision": 4,
    "logo": "eos.svg",
  },
  USD: {
    "id": "usd",
    "name": "USD",
    "symbol": "USD",
  }
};

envConfig.TOKENS = [
  envConfig.EOS,
  {
    "id": "everipedia",
    "name": "Everipedia",
    "symbol": "IQ",
    "account": "everipediaiq",
    "precision": 3,
    "logo": "iq.png",
  },
  {
    "id": "infiniverse",
    "name": "Infiniverse",
    "symbol": "INF",
    "account": "infinicoinio",
    "precision": 4,
    "logo": "inf.png",
  },
  {
    "id": "aeron",
    "name": "Aeron",
    "symbol": "ARN",
    "account": "aeronaerozzz",
    "precision": 8,
    "logo": "arn.png",
  },
  {
    "id": "emanate",
    "name": "Emanate",
    "symbol": "EMT",
    "account": "emanateoneos",
    "precision": 4,
    "logo": "emt.png",
  },
  {
    "id": "bancor",
    "name": "Bancor Network",
    "symbol": "BNT",
    "account": "bntbntbntbnt",
    "precision": 10,
    "logo": "bnt.svg",
  },
  {
    "id": "native-utility-token",
    "name": "Native Utility Token",
    "symbol": "NUT",
    "account": "eosdtnutoken",
    "precision": 9,
    "logo": "nut.svg",
    "listingTime": "10-1-2019"
  },
];

export default envConfig;
