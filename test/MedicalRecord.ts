import { expect } from "chai";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const USER_1 = "user-uuid-0001";
const DOC_1  = "doc-uuid-0001";

describe("MedicalRecord", () => {
  let contract: any;
  let owner: any;
  let nonOwner: any;

  beforeEach(async () => {
    const hre    = await import("hardhat");
    const conn   = await hre.default.network.connect();
    const ethers = conn.ethers;

    [owner, nonOwner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MedicalRecord");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("storeHash", () => {
    it("menyimpan hash dan bisa diambil kembali", async () => {
      await contract.storeHash(USER_1, DOC_1, HASH_A);
      expect(await contract.getHash(USER_1, DOC_1)).to.equal(HASH_A);
    });
    it("menambah docCount setelah store", async () => {
      await contract.storeHash(USER_1, DOC_1, HASH_A);
      expect(await contract.getDocumentCount(USER_1)).to.equal(1n);
    });
    it("revert jika hash bukan 64 karakter", async () => {
      await expect(contract.storeHash(USER_1, DOC_1, "pendek"))
        .to.be.revertedWithCustomError(contract, "InvalidHash");
    });
    it("revert jika docId sudah ada", async () => {
      await contract.storeHash(USER_1, DOC_1, HASH_A);
      await expect(contract.storeHash(USER_1, DOC_1, HASH_B))
        .to.be.revertedWithCustomError(contract, "HashAlreadyExists");
    });
    it("revert jika bukan owner", async () => {
      await expect(contract.connect(nonOwner).storeHash(USER_1, DOC_1, HASH_A))
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  describe("revokeHash", () => {
    beforeEach(async () => { await contract.storeHash(USER_1, DOC_1, HASH_A); });

    it("isRevoked true setelah revoke", async () => {
      await contract.revokeHash(USER_1, DOC_1);
      expect(await contract.isRevoked(USER_1, DOC_1)).to.be.true;
    });
    it("revert jika docId tidak ditemukan", async () => {
      await expect(contract.revokeHash(USER_1, "tidak-ada"))
        .to.be.revertedWithCustomError(contract, "HashNotFound");
    });
    it("revert jika sudah di-revoke", async () => {
      await contract.revokeHash(USER_1, DOC_1);
      await expect(contract.revokeHash(USER_1, DOC_1))
        .to.be.revertedWithCustomError(contract, "HashAlreadyRevoked");
    });
    it("revert jika bukan owner", async () => {
      await expect(contract.connect(nonOwner).revokeHash(USER_1, DOC_1))
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  describe("verifyHash", () => {
    beforeEach(async () => { await contract.storeHash(USER_1, DOC_1, HASH_A); });

    it("true jika hash cocok dan belum revoke", async () => {
      expect(await contract.verifyHash(USER_1, DOC_1, HASH_A)).to.be.true;
    });
    it("false jika hash tidak cocok", async () => {
      expect(await contract.verifyHash(USER_1, DOC_1, HASH_B)).to.be.false;
    });
    it("false jika sudah di-revoke", async () => {
      await contract.revokeHash(USER_1, DOC_1);
      expect(await contract.verifyHash(USER_1, DOC_1, HASH_A)).to.be.false;
    });
  });
});
