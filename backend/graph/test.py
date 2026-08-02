import asyncio
from .graph import final_graph

async def main():
    result = await final_graph.ainvoke(
        {"user_query": "Should I buy NVIDIA stocks?"}
    )

if __name__ == "__main__":
    asyncio.run(main())
