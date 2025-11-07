# Project Infrastructure Guide
# Project: Chatbots Growth With Flow

## 1. 🛑 Core Philosophy: COST IS THE ENEMY

This is the most important rule. The entire infrastructure is designed for **extremely low traffic** and must aim to **stay within the AWS Free Tier**.

* **Be Super Cautious:** Before you type `cdk deploy`, you must ask: "Could this change add a new cost?"
* **No Idle Costs:** We *never* use services that charge by the hour just for existing (like a provisioned RDS database).
* **One Exception:** Our *only* accepted fixed cost is the single **AWS App Runner provisioned instance**. We accept this small cost (approx. 5-10 €/month) because it's the only way to get the instant-on performance (no cold start) required for a good chatbot UX.

## 2. Technology & Region

* **Provider:** AWS (Amazon Web Services)
* **Framework:** AWS CDK (Cloud Development Kit) using **Python**.
* **Region:** All resources **must** be deployed in a European region.
    * **Primary:** `eu-west-3` (Paris)
    * **Alternative:** `eu-central-1` (Frankfurt)

## 3. How We Stay (Mostly) Free

* **Backend (App Runner):** As noted, this is our one fixed cost for performance.
* **Database (DynamoDB):** We use `PAY_PER_REQUEST` (On-Demand) mode. This is 100% covered by the Free Tier at our low traffic levels.
* **Storage (S3):** Used to store the RAG index file. The Free Tier provides more than enough storage for this.
* **Security (Secrets Manager):** *Warning!* This service has a small cost per secret (after a 30-day trial). We keep our secrets to the absolute minimum (e.g., 1-2) to keep this cost near zero.

## 4. Deployment Workflow (The Rules)

* **NEVER** deploy directly from the `main` branch. Always use a feature branch.
* **ALWAYS** check your changes before deploying. Run `cdk diff`. This will show you exactly what will be added, changed, or deleted.
* **If `cdk diff` shows new resources (e.g., "CREATE"), stop and check the AWS Pricing page for that service.**
* To deploy changes, run: `cdk deploy`
* To destroy a test stack, run: `cdk destroy`