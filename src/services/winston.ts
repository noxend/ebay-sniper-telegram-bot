import winston from 'winston';
import { TimberTransport } from '@timberio/winston';
import { Timber } from '@timberio/node';

const timber = new Timber(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1OTYxMDY5MDcsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjo4ODg5LCJ1c2VyX2lkIjoiYXBpX2tleXw4ODg5In0sInN1YiI6ImFwaV9rZXl8ODg4OSJ9.djjCKzlV8_dkWGei-bEjsTT-9n6wiY-xLfDRBXMee4c',
  '40551'
);

const logger = winston.createLogger({
  transports: [new TimberTransport(timber), new winston.transports.Console()],
});

export default logger;
