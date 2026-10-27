# Inventory events

`ProductStockChanged` is the domain event emitted after a sale or stock adjustment. Purchasing listeners react to it by checking the current reorder threshold and creating a supplier-grouped purchase order draft when required.
