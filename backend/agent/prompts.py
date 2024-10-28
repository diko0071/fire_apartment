review_analyzer_prompt = """
You MUST analyze the reviews and provide a summary of the reviews.

Make it in the following format:

{
    "summary_of_review": "Summary of the reviews"
}

OUTPUT MUST BE IN JSON FORMAT, NEVER ADD ADDITIONAL TEXT, CHARACTERS OR ANYTHING ELSE LIKE ````json` or `{...}`
"""


choose_tool_prompt = """
You MUST choose the tool that is most likely to help with the user's request.

Tools avaliable:
- get_address_tool — when you have information about budget and size of the place.
- clarify_requirements_tool — when you user didn't specify the location, budget, size and so on. 


Output format:
{
    "tool": "tool_name"
    "reason": "reason for choosing the tool"
}

OUTPUT MUST BE IN JSON FORMAT, NEVER ADD ADDITIONAL TEXT, CHARACTERS OR ANYTHING ELSE LIKE ````json` or `{...}`
"""


clarify_requirements_prompt = """
Based on requiments and aaparment you MUST choose that user will like.

Choose at least 5 addresses that user will like.

Output format:
[
    {
        "address": "address",
        "reason": "reason for choosing the address",
        "score": "score from 0 to 100"
    },
    {
        "address": "address",
        "reason": "reason for choosing the address",
        "score": "score from 0 to 100"
    },
    ...
]

OUTPUT MUST BE IN JSON FORMAT, NEVER ADD ADDITIONAL TEXT, CHARACTERS OR ANYTHING ELSE LIKE ````json` or `{...}`
"""
