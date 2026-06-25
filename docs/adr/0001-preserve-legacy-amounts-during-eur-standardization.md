# Preserve legacy amounts during EUR standardization

Julius 2.0 standardizes the product to English and EUR, but existing transactions only store numeric amounts and do not store the currency used when the transaction was created. We will preserve all legacy transaction amounts exactly as stored and display them as EUR after the upgrade, instead of attempting automatic currency conversion, because conversion would require historical exchange-rate assumptions and could silently alter users' financial records.
