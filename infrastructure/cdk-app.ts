#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { BaseStaticSiteStack } from '../../../shared/infrastructure/BaseStack';

const app = new App();

new BaseStaticSiteStack(app, 'GameDealWaveStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION || 'us-east-1',
  },
  domain: 'gamedealwave.online',
  buildOutputDir: '../.next/standalone',
  languages: ['ko', 'en', 'ja'],
  description: 'GameDealWave — Steam/PSN/Xbox deal tracker with regional price arbitrage',
});

app.synth();
