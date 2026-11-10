# 첨부 파일 예시: 글에서 설명한 코드를 그대로 내려받을 수 있어요.
def solve(flag: str) -> bool:
    return flag.startswith("FLAG{") and flag.endswith("}")


if __name__ == "__main__":
    print(solve("FLAG{hello_pages}"))
