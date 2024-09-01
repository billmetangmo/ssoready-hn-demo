# ssoready-hn-demo

`ssoready-hn-demo` is a simple demonstration of Single Sign-On (SSO) integration using [ssoready](https://ssoready.com).

## Prerequisites

- An sso-ready environment configured with Redirect URL where http://localhost:3000/ssoready-callback
- An organization within the environment with external id set and a SAML connection configured
- An sso-ready API key

## Installation

```bash
git clone https://github.com/ucarion/ssoready-hn-demo.git
cd ssoready-hn-demo
npm install
```

## Configuration

Search the code for `domainToOrgMap` and update `domain <-> organization_id` as you configured in `sso-ready`.

## Usage

```bash
export SSOREADY_API_KEY=xxxxxx
npm run dev
```