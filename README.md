# J-Node Abstract System

A web application to publish conference information and to collect, review and publish conference abstracts. It is
run by the INCF Japan Node and succeeds [GCA-Web](https://github.com/G-Node/GCA-Web), the conference application of the
German Neuroinformatics Node (G-Node), which is no longer maintained. It is a rewrite in Spring Boot and React that
follows the design of GCA-Web and took over its data.

- Public pages show the conferences with their schedules, locations, floor plans and accepted abstracts.
- Authors write abstracts with authors, affiliations, figures and references, and submit them for review.
- Conference owners review the submitted abstracts, assign them to presentation groups and numbers, and manage the
  conference settings.
- Site admins create conferences and accounts. There is no public sign up.

## Technology

- Backend: Spring Boot 4 (Java 17 or later), Spring Security, Spring Data JPA, MariaDB/MySQL (H2 for tests)
- Frontend: React 19, TypeScript, Redux Toolkit, React Bootstrap, built with Vite
- The frontend is built into the backend, so the application is a single executable jar.

## Requirements

- JDK 17 or later
- Node.js 24 and npm for frontend development. The Maven build downloads its own Node.js, so building the jar needs
  only the JDK.
- MariaDB or MySQL for production and for development with real data

## Development

### Local configuration

Settings in `application.properties` in the working directory override the defaults in
`src/main/resources/application.properties`, which also lists the available settings as comments. The file in the
working directory is ignored by git, so keep local and production settings there. A minimal local configuration:

```properties
spring.datasource.url=jdbc:mariadb://localhost/abstracts
spring.datasource.username=abstracts
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update

app.url=http://localhost:5173
app.admins=admin@example.com
app.path.banners=./banners
app.path.figures=./figures
app.mail.mock=true
```

Without a database setting the application uses an in-memory H2 database, which starts empty. As accounts are created
only by site admins, use a database with at least one account whose mail is listed in `app.admins`.

### Running

Start the backend on port 8080, skipping the frontend build:

```sh
./mvnw spring-boot:run -Dskip.npm -Dskip.installnodenpm
```

Start the frontend development server on port 5173, which forwards `/api` to the backend:

```sh
npm install
npm run dev
```

Then open <http://localhost:5173>. With `app.mail.mock=true`, mails such as password reset links are written to the
backend log instead of being sent.

### Tests, linting and formatting

| Command | Purpose |
| --- | --- |
| `./mvnw test` | Run the backend tests against an in-memory database. They ignore `application.properties` in the working directory. |
| `./mvnw spotless:apply` | Format the Java sources (profile in `eclipse-formatter.xml`). |
| `./mvnw spotless:check` | Check the format of the Java sources. |
| `npm run lint` | Lint and check the format of the frontend with Biome. |
| `npm run format` | Fix the lint findings and format the frontend with Biome. |

VS Code formats Java files on save with the same Eclipse profile and the frontend with Biome (see `.vscode`).

## Building

```sh
./mvnw clean package
```

This builds the frontend into `src/main/resources/static` and packages everything into
`target/abstracts-<version>.jar`. Run it with an `application.properties` in the working directory:

```sh
java -jar abstracts-1.0.0.jar
```

## Configuration

Application settings:

| Setting | Default | Description |
| --- | --- | --- |
| `app.url` | `http://localhost:8080` | Base URL of the site, used for links in mails. |
| `app.admins` | (none) | Comma separated mail addresses of the site admins. |
| `app.read-only` | `false` | Only site admins can log in, everyone else just reads the published information. |
| `app.path.banners` | `./banners` | Directory of the conference logos and thumbnails. |
| `app.path.figures` | `./figures` | Directory of the abstract figures. |
| `app.mail.mock` | `true` | Write mails to the log instead of sending them. |
| `app.mail.from.address` | `abstracts@example.com` | Sender address of mails. |
| `app.mail.from.name` | `The J-Node Abstract System` | Sender name of mails. |

Spring settings that matter in production:

| Setting | Description |
| --- | --- |
| `spring.datasource.url`, `.username`, `.password` | Database connection. |
| `spring.jpa.hibernate.ddl-auto=update` | Keeps the database schema in step with the entities, see below. |
| `spring.mail.host`, `.port`, `.username`, `.password` and `spring.mail.properties.*` | SMTP server. |
| `server.servlet.session.cookie.secure=true` | Sends the session cookie over HTTPS only. |

## Deployment

The database schema is updated by Hibernate on startup (`spring.jpa.hibernate.ddl-auto=update`), which adds missing
tables and columns but never drops or changes existing ones. Back up the database before deploying a new version.

Check the production `application.properties` before starting a new version:

- `app.admins` is set, and every listed address has an account. Without it the site has no admins.
- `app.url` is the public URL of the site.
- `app.mail.mock=false` and the `spring.mail.*` settings point to the SMTP server. Otherwise mails are only logged.
- `server.servlet.session.cookie.secure=true` if the site is served over HTTPS.
- `app.read-only=true` while the site should only show published information.
- The directories of `app.path.banners` and `app.path.figures` are writable by the application.

Times are stored without time zone. Conference dates and schedules are local times of the venue and are shown as
they are. Timestamps such as modification times are recorded in UTC, as the application runs in UTC, and are shown
in the time zone of the browser.

## Project structure

```text
src/main/java/jp/neuroinf/abstracts
  controller/   REST endpoints under /api, and forwarding of application paths to the frontend
  service/      business logic and permission checks
  entity/       JPA entities
  dto/, form/   response and request bodies
  core/         security and application configuration
  component/    mail, file storage, tokens and login attempt limiting
frontend/src
  features/     pages and Redux slices by feature (abstract, account, conference, user)
  api/          API clients
  entities/     types of the API data
scripts/        build helpers, e.g. copying MathJax so that the site serves it itself
```

## Acknowledgements

This system is based on the design of [GCA-Web](https://github.com/G-Node/GCA-Web) by the German Neuroinformatics Node
(G-Node), including its data model and review workflow. We thank the G-Node for developing GCA-Web and making it
available under an open source license.

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).
