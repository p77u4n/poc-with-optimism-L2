# POC

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Concept (Model)

### Task

User khi upload document lên hệ thống sẽ mã hóa và lưu trữ tại một storage (trong implementation này lưu ở R2 Cloudflare),  sau đó TEE service sẽ xử lý nó bằng thuật toán học máy, cuối cùng cập nhật kết quả

Tất cả quá trình này ta gọi là một Task

### Doc

Là file mà người dùng upload lên, có định danh là docID

## Mạng

Kiểm thử chạy trên L2 chain dựng trên local được cung cấp bởi hardhat

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-16-23-39-24-image.png)

### Explorer

Trong repo (fork từ repo Scaffold-OP), có thư mục nextjs, sau khi deploy và compile contract lên local network, scaffold-op sẽ tự động sinh các abi metada của contract được deploy để giúp explorer có thể thao tác với chúng. Nhờ đó ta có thể debug contract trên giao diện này.

![](/home/p77u4n/.var/app/com.github.marktext.marktext/config/marktext/images/2024-05-16-23-55-37-image.png)

## Kiến trúc

Bao gồm các service sau

* Contract chạy trên EVM Sepolia, L2 chain network là local chain cung cấp bởi hardhat chạy trên máy

* **Gateway**: là RestAPI bằng ExpressJS, có nhiệm vụ nhận upload từ người dùng và thực hiện các truy vấn cơ bản về trạng thái của task, có tương tác với onchain để thực hiện khởi tạo session, và cập nhận wallet user trong session (vì lúc gửi lên là admin gửi nên user trong session sẽ là admin, vậy nên sau khi khởi tạo cần có cập nhập lại với địa chỉ ví user)

* **TEE**: là một service mock giả lập môi trường an toàn để xử lý dữ liệu Gene của người đăng ký, nó giữ private key để giải mã rồi mới xử lý dữ liệu.

* **User-Portal**: là giao diện web cho phép người dùng upload dữ liệu, gửi request confirm khi TEE đã xử lý xong tác vụ học máy.

### Contract

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-16-23-55-37-image.png)

#### Test

```
yarn test
```

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-16-23-59-07-image.png)

```
yarn build
```

Để chạy được các service thì cần phải build abi của genomicdao trước, vì các service khác có tham khảo type của module này

#### Compile

```
yarn clean-compile
```

Sẽ sinh ra artifact và typechain-types (chứa abi)

#### Deploy

Cần biến môi trường `DEPLOYER_PRIVATE_KEY`

```
yarn deploy
```

Được địa chỉ contract ta cần lưu vào để nhét vào env của các service cần interacting với contract

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-17-00-02-07-image.png)

### Gateway

Stack: NodeJS, ExpressJS

[core](https://github.com/p77u4n/simple-poc-interview-l2/tree/main/packages/gateway/core): chứa định nghĩa domain model, và base class định nghĩa cho các command handler, command querier

**port**:

* task-queue: tương tác với task queue nhằm put task cho TEE thực hiện xử lý (impl: [RabbitMQ](https://github.com/p77u4n/simple-poc-interview-l2/blob/main/packages/gateway/ports/task-queue/rabbit-queue.ts))

* encryptor: tương tác với encryptor để mã hóa dữ liệu (impl: [Encryptor]([https://github.com/p77u4n/simple-poc-interview-l2/blob/main/packages/gateway/ports/encryptor.default.ts))

* onchain: tương tác với network onchain (impl: [Web3](https://github.com/p77u4n/simple-poc-interview-l2/blob/main/packages/gateway/ports/onchain/onchain.web3js.ts))

* object-storage: để tương tác với object storage provider (implementation: [S3Port](https://github.com/p77u4n/simple-poc-interview-l2/blob/main/packages/gateway/ports/s3-storage-port.ts))

**service**: command usecase ở application layer, chỉ gồm một usecase cơ bản

* [requestAnalytic](https://github.com/p77u4n/simple-poc-interview-l2/blob/main/packages/gateway/service/index.ts)   

Usecase requestAnalytic bao gồm 3 tác vụ chính có side-effect cần đảm bảo cùng boundary transaction là

* cập nhật dữ liệu task trong DB

* đẩy task vào queue để tương tác với TEE (1)

* gọi upload của onchain (2)

cả ba tác vụ trên đều có thể fail, do vậy dùng event-driven để phối hợp chúng. Sau khi requestAnalytic hoàn thành tạo record cho task, và mã hóa file, thì nó sẽ bắn một event là StartEvent, (1) và (2) sẽ lắng nghe là thực hiện như các [event subscriber]([https://github.com/p77u4n/simple-poc-interview-l2/tree/main/packages/gateway/event-listener/start-event)

#### Up

```
yarn
yarn build
yarn express-rest:dev
```

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-17-00-22-20-image.png)

### TEE

Stack: Python, Pika RabbitMQ

Chạy như một worker lắng nghe queue đẩy vào để thực hiện xử lý, sau khi xử lý xong sẽ update trạng thái vào trong DB.

Tương tác với Gateway thông qua hai cách

* Với việc tương tác để invoking thao tác xử lý học máy, thì thông qua task queue, event queue

* Với việc trao đổi về trạng thái của task thì thông qua bộ nhớ chung là database

#### Up

```
poetry shell
poetry install
python run-consumer.py
```



![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-17-00-20-41-image.png)

## ### User portal

Stack: React, Web3Js

![](https://pub-655b129b1b4f44dda33a7f1a9bf4d857.r2.dev/2024-05-17-00-24-12-image.png)
