FROM node:18-alpine AS deps

# If you need libc for any of your deps, uncomment this line:
# RUN apk add --no-cache libc6-compat

# Copy over ONLY the package.json and yarn.lock
# so that this `yarn install` layer is only recomputed
# if these dependency files change. Nice speed hack!
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# END DEPS IMAGE

# Now we make a container to handle our Build
FROM node:18-alpine AS BUILD_IMAGE

# Set up our work directory again
WORKDIR /app

# Bring over the deps we installed and now also
# the rest of the source code to build the Next
# server for production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Remove all the development dependencies since we don't
# need them to run the actual server.
RUN rm -rf node_modules
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

# END OF BUILD_IMAGE

# This starts our application's run image - the final output of build.
FROM node:18-alpine

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Pull the built files out of BUILD_IMAGE - we need:
# 1. the package.json and yarn.lock
# 2. the Next build output and static files
# 3. the node_modules.
WORKDIR /app
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/package.json /app/yarn.lock ./
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/public ./public
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/.next ./.next
COPY --from=BUILD_IMAGE --chown=nextjs:nodejs /app/next.config.js  ./

USER nextjs

EXPOSE 4000

CMD [ "yarn", "start" ]
