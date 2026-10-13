# G6-04 A整改验证回执

- 归档内容commit：c29032ff8febdbf16fca2aa63e76cca5467d1fb9；整改前一步f0d5fd7保留实际9项分类失败。
- C输入Review：56673cb / 7bfccad，结论CHANGES_REQUIRED；本轮A只整改002/003，不代C定向复验/B确认。
- `submitted-verification.json`：已提交索引及检出态只读PASS，6130项/941行，索引前后指纹相同、受检写0。
- `all-inputs-readonly-proof.json`：943个输入文件实际前后字节相同，变化0；不只验证索引一文件。
- `verification-behavior-tests-final.json`：10个隔离Git场景符合实际预期，包括JSONL/NDJSON/摘要行尾、真实内容/二进制/索引篡改拒绝与已提交日志回填。
- `submitted-failed-text-classification.json`与`working-tree-failed-review-locator.json`：实际失败保留，不迁移为原先已通过；早期草稿结果不作为提交态证明。

第三方运行 `python scripts/g6/audit-g6-04.py --verify`，默认选择索引最后修改的内容commit；后续日志回填不改写该快照。此目录记录依赖索引，已明确排除循环自hash，通过其独立Git回填commit验真。C完成定向复验并增量挂接，随后B确认，再由A执行最终准出；当前REVIEW/未冻结/真实延期。
