# Forkcast
## Teammember
- Kerimcan Yagci, Lukas Grünzweil, Erik Reitbauer, Nico Haider

## Color palette
https://coolors.co/e8f1f2-b3efb2-7a9e7e-31493c-001a23

![Mockup](mockup.png)

## DB - Entities
- User (id, name, email, password, profilePicture)
- Friend (userId, friendId)
- Notification (id, userId, type, content, isRead)
- CalenderEntry(userId, date, recipeId)
- Recipe(id, name, image)
- FavoriteFood(userId, recipeId)

![Erd-Diagram](https://img.plantuml.biz/plantuml/svg/bL91QWCn3BplAqJk-K098H2QIw64G1-Wxcgt0jjQPALbIVBtsbdQsc4llTXunfePoTv5GxMpTqr3mTWcMBr5qXLS6W3ku0au60saiDaSNxRRX0RqbF1eoc58P_B8hWH6ZF5BjAimbPuT7RcrinRbjp_VWpA5BZiNuAiOzzoYiOGvb4rZPTzA2XYiX3YU2BFzkuWZ3ANWYLeUwJ_ziSTXEV4UNKfC-XnCfrcoGyjtysRigUeFFqNPw23oqsKUDLolwxLSe19hvfZBN5LMgZvKLLHLL4xrGUx-2Ac33upGtm_BFF_IpIwjwGTz0m00)